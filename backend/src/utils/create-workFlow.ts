import { prisma } from "../db";
import type { GmailTriggerConfig } from "../types/trigger-config";
import { 
  ConnectionNotFoundError,
  TriggerDefinitionNotFoundError,
  AppMismatchError,
} from "../utils/Errors";

interface CreateWorkflowParams {
  userId: string;
  name: string;
  connectionId: string;
  triggerConfig: GmailTriggerConfig;
  intervalMinutes: number;
  triggerDefinationKey: string;
}

export const createNewWorkFlow = async ({
  userId,
  name,
  connectionId,
  triggerConfig,
  intervalMinutes,
  triggerDefinationKey
}: CreateWorkflowParams) => {
  try {
    // 1. Validate connections and definitions
    const [connection, triggerDefinition] = await Promise.all([
      prisma.connection.findUnique({ where: { id: connectionId } }),
      prisma.triggerDefinition.findUnique({
        where: { key: triggerDefinationKey },
        include: { app: true }
      })
    ]);

    if (!connection) throw new ConnectionNotFoundError(connectionId);
    if (!triggerDefinition) throw new TriggerDefinitionNotFoundError(triggerDefinationKey);
    if (connection.appId !== triggerDefinition.app.id) {
      throw new AppMismatchError(connection.appId, triggerDefinition.app.id);
    }

    // 3. Create in transaction
    const triggerConfigJson = JSON.parse(JSON.stringify(triggerConfig));
    return await prisma.$transaction(async (tx) => {
      const workflow = await tx.workflow.create({
        data: {
          name,
          userId,
          triggers: {
            create: {
              type: triggerDefinition.type,
              definition: {connect: {id: triggerDefinition.id}},
              connection: {connect: {id: connection.id}},
              config: triggerConfigJson
            }
          }
        }
      });

      const polling = await tx.polling.create({
        data: {
          workflowId: workflow.id,
          interval: intervalMinutes * 60 * 1000,
          nextPollAt: new Date(Date.now() + intervalMinutes * 60 * 1000)
        }
      });
      return { workflow, polling };
    });
  } catch (error) {
    console.error(`Workflow creation failed: ${error}`);
    throw error; // Let the caller handle specific errors
  }
};
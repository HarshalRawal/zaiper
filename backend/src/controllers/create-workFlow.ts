import { Request, Response } from "express";
import { createNewWorkFlow } from "../utils/create-workFlow";
interface AuthenticatedRequest extends Request {
    user?: { id: string };
}
export const createWorkflow = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const {name,connectionId,triggerConfig,intervalMinutes,triggerDefinationKey} = req.body;
        console.log(req.body);
        const userId = "f6f18845-0461-41b9-9dbc-d8deec17a679";
        if(!userId){
            throw new Error("User not found");
        }
        const params = {
            userId,
            name,
            connectionId,
            triggerConfig,
            intervalMinutes,
            triggerDefinationKey
        }
        const{workflow,polling} = await createNewWorkFlow(params);
        res.status(201).json({workflow,polling});
    } catch (error) {
        res.status(500).json({ error: "Failed to create workflow" });
    }
}
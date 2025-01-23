import { Request, Response } from "express";
import { prisma } from "../db/index";


export const getAppTriggers = async (req: Request, res: Response) => {
    try {
        const {appId} = req.params;
        if(!appId){
            res.status(400).json({error:"App ID is required"});
            return;
        }
        const preDefinedTriggers = await prisma.triggerDefinition.findMany({where:{appId}});
        res.status(200).json({preDefinedTriggers:preDefinedTriggers});
        return;
    } catch (error) {
        res.status(500).json({error:"Internal server error"});
    }
}

export const checkIsConnectionRequired = async (req: Request, res: Response) => {
    try {
        const {key} = req.params;
        if(!key){
            res.status(400).json({error:" key is required"});
            return;
        }
        const triggerDefinition = await prisma.triggerDefinition.findFirst({where:{key}});
        if(!triggerDefinition){
            res.status(404).json({error:"Trigger definition not found"});
            return;
        }
        res.status(200).json({isConnectionRequired:triggerDefinition.connectionRequired});
        return;
    } catch (error) {
        res.status(500).json({error:"Internal server error"});
    }
}
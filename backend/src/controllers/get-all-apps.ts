import { Request, Response } from "express";
import { prisma } from "../db/index"


export const getAllApps = async (req: Request, res: Response) => {
    try {
        const apps = await prisma.app.findMany();
        res.status(200).json({apps:apps});
        return;
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
        return;
    }
}
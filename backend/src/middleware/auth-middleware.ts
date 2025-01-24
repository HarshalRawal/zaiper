// import jwt from "jsonwebtoken";
// import { Request, Response, NextFunction } from "express";
// export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
//     const token = req.headers.authorization?.split(' ')[1];
//     if (!token) {
//         return res.status(401).json({ message: 'Unauthorized' });
//     }
//     try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET!);
//         req.user = {
//             id: decoded.userId
//         }
//         next();
//     } catch (error) {
//         return res.status(401).json({ message: 'Unauthorized' });
//     }
// }
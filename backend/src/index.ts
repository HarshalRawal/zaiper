import express from "express";
export const app = express();
import routes from "./routes/index";
import cors from "cors";
app.use(cors());
app.use(express.json());
app.use("/api",routes);

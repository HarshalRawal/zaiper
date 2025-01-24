import express from "express";
import session from "express-session";
export const app = express();
import routes from "./routes/index";
import cors from "cors";
app.use(session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));
app.use(cors());
app.use(express.json());
app.use("/api",routes);

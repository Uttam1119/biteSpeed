import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import identifyRouter from "./routes/identify";

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use(identifyRouter);

app.get("/", (req, res) => res.json({ status: "ok" }));

export default app;

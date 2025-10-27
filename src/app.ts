import express from "express";
import identifyRouter from "./routes/identify";

const app = express();

app.use(express.json());

// Routes
app.use(identifyRouter);

export default app;

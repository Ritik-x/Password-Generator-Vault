import express from "express";
import "dotenv/config";
import mongoose from "mongoose";

import cors from "cors";

import cookieParser from "cookie-parser";
import router from "./routes/auth.route.js";
import vrouter from "./routes/vault.route.js";
import connectDb from "./db/db.js";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors());
connectDb();

const port = process.env.PORT || 3000;

app.use("/", router);
app.use("/vault", vrouter);
app.get("/", (req, res) => {
  res.send(`server is running on ${port}`);
});
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

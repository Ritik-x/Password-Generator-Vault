import express from "express";
import "dotenv/config";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import cookieParser from "cookie-parser";
import router from "./routes/auth.route.js";
import vrouter from "./routes/vault.route.js";
import connectDb from "./db/db.js";

const app = express();
app.set("trust proxy", 1);

const allowedOrigins = (
  process.env.CORS_ORIGIN || "https://password-generator-vault-six.vercel.app/"
)
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true); // allow tools/curl
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(helmet());
app.use(express.json());
app.use(cookieParser());

connectDb();

const port = process.env.PORT || 4000;

app.use("/", router);
app.use("/vault", vrouter);
app.get("/", (req, res) => {
  res.send(`server is running on ${port}`);
});
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

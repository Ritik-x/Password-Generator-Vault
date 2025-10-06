import express from "express";
import {
  createVault,
  getVault,
  deleteItem,
  updateItem,
} from "../controllers/vault.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { vaultLimiter } from "../middlewares/valtlimiter.middleware.js";

const vrouter = express.Router();
// vrouter.use(protect);
vrouter.post("/", authMiddleware, vaultLimiter, createVault);
vrouter.get("/", authMiddleware, vaultLimiter, getVault);
vrouter.put("/:id", authMiddleware, vaultLimiter, updateItem);
vrouter.delete("/:id", authMiddleware, deleteItem);

export default vrouter;

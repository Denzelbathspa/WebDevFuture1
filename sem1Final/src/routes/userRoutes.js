import express from "express";
import { getUsers, createUser } from "../controllers/UserController.js";

const router = express.Router();

// GET /api/users
router.get("/", getUsers);

// POST /api/users
router.post("/", createUser);

export default router;
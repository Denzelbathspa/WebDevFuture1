import express from "express";
import { 
  getUsers, 
  createUser, 
  updateUserAdminStatus, 
  deleteUser
} from "../controllers/UserController.js";

const router = express.Router();

router.get("/", getUsers);
router.post("/", createUser);
router.patch("/:id/admin", updateUserAdminStatus);
router.delete("/:id", deleteUser);

export default router;
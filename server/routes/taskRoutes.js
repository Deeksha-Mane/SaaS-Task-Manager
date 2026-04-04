import express from "express";
import { 
    createTask, 
    getTasks, 
    updateTask, 
    deleteTask,
    checkRecurringTasks,
    checkReminders
} from "../controllers/taskController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes are protected - require authentication
router.post("/", protect, createTask);
router.get("/", protect, getTasks);
router.put("/:id", protect, updateTask);
router.delete("/:id", protect, deleteTask);
router.post("/check-recurring", protect, checkRecurringTasks);
router.post("/check-reminders", protect, checkReminders);

export default router;

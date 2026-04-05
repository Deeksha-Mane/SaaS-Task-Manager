import express from "express";
import { 
    createTask, 
    getTasks, 
    updateTask, 
    deleteTask,
    checkRecurringTasks,
    checkReminders,
    addComment,
    deleteComment
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
router.post("/:id/comments", protect, addComment);
router.delete("/:id/comments/:commentId", protect, deleteComment);

export default router;

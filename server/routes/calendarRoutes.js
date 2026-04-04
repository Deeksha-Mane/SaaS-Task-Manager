import express from "express";
import { 
    getCalendarAuthUrl,
    handleCalendarCallback,
    syncTaskToCalendar,
    updateCalendarEventForTask,
    deleteCalendarEventForTask,
    disconnectCalendar,
    getCalendarStatus
} from "../controllers/calendarController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/auth-url", protect, getCalendarAuthUrl);
router.get("/callback", handleCalendarCallback);
router.get("/status", protect, getCalendarStatus);
router.post("/sync-task/:taskId", protect, syncTaskToCalendar);
router.put("/update-event/:taskId", protect, updateCalendarEventForTask);
router.delete("/delete-event/:taskId", protect, deleteCalendarEventForTask);
router.post("/disconnect", protect, disconnectCalendar);

export default router;

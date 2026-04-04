import User from "../models/User.js";
import Task from "../models/Task.js";
import { 
    getAuthUrl, 
    getTokensFromCode, 
    createCalendarEvent,
    updateCalendarEvent,
    deleteCalendarEvent,
    isCalendarConfigured
} from "../utils/googleCalendar.js";

/**
 * Get Google Calendar Auth URL
 * GET /api/calendar/auth-url
 * Protected Route
 */
export const getCalendarAuthUrl = async (req, res) => {
    try {
        if (!isCalendarConfigured()) {
            return res.status(400).json({ 
                message: "Google Calendar not configured. Add credentials to .env file." 
            });
        }

        // Pass userId as state to identify user after OAuth
        const authUrl = getAuthUrl(req.user._id.toString());
        res.status(200).json({ authUrl });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

/**
 * Handle OAuth Callback
 * GET /api/calendar/callback
 * Public Route (OAuth callback)
 */
export const handleCalendarCallback = async (req, res) => {
    try {
        const { code, state } = req.query; // state contains userId

        if (!code) {
            return res.status(400).json({ message: "No authorization code provided" });
        }

        const tokens = await getTokensFromCode(code);

        if (!tokens) {
            return res.status(400).json({ message: "Failed to get tokens" });
        }

        // Save tokens to user's account
        if (state) {
            const user = await User.findById(state);
            if (user) {
                user.calendarTokens = tokens;
                user.calendarConnected = true;
                await user.save();
            }
        }

        // Redirect to frontend
        const redirectUrl = `${process.env.CLIENT_URL}/dashboard?calendar_connected=true`;
        res.redirect(redirectUrl);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

/**
 * Sync Task to Calendar
 * POST /api/calendar/sync-task/:taskId
 * Protected Route
 */
export const syncTaskToCalendar = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        
        if (!user.calendarConnected || !user.calendarTokens) {
            return res.status(400).json({ message: "Calendar not connected. Please connect your Google Calendar first." });
        }

        const task = await Task.findById(req.params.taskId);

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        // Check if user owns this task
        if (task.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }

        const result = await createCalendarEvent(task, user.calendarTokens);

        if (result.success) {
            // Save calendar event ID to task
            task.calendarEventId = result.eventId;
            await task.save();

            res.status(200).json({ 
                message: "Task synced to your calendar",
                eventId: result.eventId,
                eventLink: result.eventLink
            });
        } else {
            res.status(400).json({ message: result.message || result.error });
        }
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

/**
 * Update Calendar Event
 * PUT /api/calendar/update-event/:taskId
 * Protected Route
 */
export const updateCalendarEventForTask = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        
        if (!user.calendarConnected || !user.calendarTokens) {
            return res.status(400).json({ message: "Calendar not connected" });
        }

        const task = await Task.findById(req.params.taskId);

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        if (task.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }

        if (!task.calendarEventId) {
            return res.status(400).json({ message: "Task not synced to calendar" });
        }

        const result = await updateCalendarEvent(task.calendarEventId, task, user.calendarTokens);

        if (result.success) {
            res.status(200).json({ message: "Calendar event updated" });
        } else {
            res.status(400).json({ message: result.message || result.error });
        }
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

/**
 * Delete Calendar Event
 * DELETE /api/calendar/delete-event/:taskId
 * Protected Route
 */
export const deleteCalendarEventForTask = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        
        if (!user.calendarConnected || !user.calendarTokens) {
            return res.status(400).json({ message: "Calendar not connected" });
        }

        const task = await Task.findById(req.params.taskId);

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        if (task.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }

        if (!task.calendarEventId) {
            return res.status(400).json({ message: "Task not synced to calendar" });
        }

        const result = await deleteCalendarEvent(task.calendarEventId, user.calendarTokens);

        if (result.success) {
            task.calendarEventId = null;
            await task.save();
            res.status(200).json({ message: "Calendar event deleted" });
        } else {
            res.status(400).json({ message: result.message || result.error });
        }
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

/**
 * Disconnect Calendar
 * POST /api/calendar/disconnect
 * Protected Route
 */
export const disconnectCalendar = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        user.calendarTokens = null;
        user.calendarConnected = false;
        await user.save();

        res.status(200).json({ message: "Calendar disconnected successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

/**
 * Get Calendar Status
 * GET /api/calendar/status
 * Protected Route
 */
export const getCalendarStatus = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.status(200).json({ 
            connected: user.calendarConnected || false,
            hasTokens: !!user.calendarTokens
        });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

import Task from "../models/Task.js";
import { sendTaskReminder } from "../utils/email.js";

/**
 * Create Task
 * POST /api/tasks
 * Protected Route
 */
export const createTask = async (req, res) => {
    try {
        const { title, description, priority, dueDate, tags, subtasks, notes } = req.body;

        if (!title) {
            return res.status(400).json({ message: "Please add a title" });
        }

        // Get the highest order number and add 1
        const highestOrderTask = await Task.findOne({ user: req.user._id }).sort({ order: -1 });
        const order = highestOrderTask ? highestOrderTask.order + 1 : 0;

        const task = await Task.create({
            title,
            description,
            priority: priority || "medium",
            dueDate: dueDate || null,
            tags: tags || [],
            subtasks: subtasks || [],
            notes: notes || "",
            order,
            isRecurring: req.body.isRecurring || false,
            recurringPattern: req.body.recurringPattern || "",
            lastRecurred: req.body.isRecurring ? new Date() : null,
            reminderEnabled: req.body.reminderEnabled || false,
            reminderDate: req.body.reminderDate || null,
            reminderSent: false,
            user: req.user._id
        });

        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

/**
 * Get All Tasks
 * GET /api/tasks?status=pending&page=1&limit=10
 * Protected Route
 */
export const getTasks = async (req, res) => {
    try {
        const { status, priority, page = 1, limit = 10 } = req.query;

        // Build filter - only get tasks for logged-in user
        const filter = { user: req.user._id };
        
        if (status) {
            filter.status = status;
        }

        if (priority) {
            filter.priority = priority;
        }

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Get tasks with pagination
        const tasks = await Task.find(filter)
            .sort({ createdAt: -1 }) // Newest first
            .limit(parseInt(limit))
            .skip(skip);

        // Get total count for pagination info
        const total = await Task.countDocuments(filter);

        res.status(200).json({
            tasks,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

/**
 * Update Task
 * PUT /api/tasks/:id
 * Protected Route
 */
export const updateTask = async (req, res) => {
    try {
        const { title, description, status, priority, dueDate, tags, subtasks, notes, order } = req.body;

        // Find task
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        // Check if user owns this task
        if (task.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }

        // Update fields
        if (title !== undefined) task.title = title;
        if (description !== undefined) task.description = description;
        if (status !== undefined) task.status = status;
        if (priority !== undefined) task.priority = priority;
        if (dueDate !== undefined) task.dueDate = dueDate;
        if (tags !== undefined) task.tags = tags;
        if (subtasks !== undefined) task.subtasks = subtasks;
        if (notes !== undefined) task.notes = notes;
        if (order !== undefined) task.order = order;
        if (req.body.isRecurring !== undefined) task.isRecurring = req.body.isRecurring;
        if (req.body.recurringPattern !== undefined) task.recurringPattern = req.body.recurringPattern;
        if (req.body.reminderEnabled !== undefined) task.reminderEnabled = req.body.reminderEnabled;
        if (req.body.reminderDate !== undefined) task.reminderDate = req.body.reminderDate;
        if (req.body.reminderSent !== undefined) task.reminderSent = req.body.reminderSent;

        const updatedTask = await task.save();

        res.status(200).json(updatedTask);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

/**
 * Delete Task
 * DELETE /api/tasks/:id
 * Protected Route
 */
export const deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        // Check if user owns this task
        if (task.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }

        await task.deleteOne();

        res.status(200).json({ message: "Task deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

/**
 * Check and Create Recurring Tasks
 * POST /api/tasks/check-recurring
 * Protected Route
 */
export const checkRecurringTasks = async (req, res) => {
    try {
        const recurringTasks = await Task.find({
            user: req.user._id,
            isRecurring: true,
            status: 'completed'
        });

        const now = new Date();
        const createdTasks = [];

        for (const task of recurringTasks) {
            if (!task.lastRecurred) continue;

            const lastRecurred = new Date(task.lastRecurred);
            let shouldRecur = false;

            switch (task.recurringPattern) {
                case 'daily':
                    // Check if 24 hours have passed
                    shouldRecur = (now - lastRecurred) >= 24 * 60 * 60 * 1000;
                    break;
                case 'weekly':
                    // Check if 7 days have passed
                    shouldRecur = (now - lastRecurred) >= 7 * 24 * 60 * 60 * 1000;
                    break;
                case 'monthly':
                    // Check if 30 days have passed
                    shouldRecur = (now - lastRecurred) >= 30 * 24 * 60 * 60 * 1000;
                    break;
            }

            if (shouldRecur) {
                // Create new task based on recurring task
                const newTask = await Task.create({
                    title: task.title,
                    description: task.description,
                    priority: task.priority,
                    tags: task.tags,
                    subtasks: task.subtasks.map(st => ({ text: st.text, completed: false })),
                    notes: task.notes,
                    status: 'pending',
                    isRecurring: true,
                    recurringPattern: task.recurringPattern,
                    lastRecurred: now,
                    user: req.user._id
                });

                // Update the original task's lastRecurred
                task.lastRecurred = now;
                await task.save();

                createdTasks.push(newTask);
            }
        }

        res.status(200).json({
            message: `${createdTasks.length} recurring tasks created`,
            tasks: createdTasks
        });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};


/**
 * Check and Send Reminders
 * POST /api/tasks/check-reminders
 * Protected Route
 */
export const checkReminders = async (req, res) => {
    try {
        const now = new Date();
        
        // Find tasks with reminders that haven't been sent yet
        const tasksWithReminders = await Task.find({
            user: req.user._id,
            reminderEnabled: true,
            reminderSent: false,
            status: 'pending',
            reminderDate: { $lte: now }
        }).populate('user', 'name email');

        const reminders = [];

        for (const task of tasksWithReminders) {
            // Send email reminder
            const emailResult = await sendTaskReminder(
                task.user.email,
                task.user.name,
                task
            );

            // Mark reminder as sent
            task.reminderSent = true;
            await task.save();

            reminders.push({
                taskId: task._id,
                title: task.title,
                dueDate: task.dueDate,
                reminderDate: task.reminderDate,
                userEmail: task.user.email,
                userName: task.user.name,
                emailSent: emailResult.success
            });

            if (emailResult.success) {
                console.log(`✅ Reminder sent: "${task.title}" to ${task.user.email}`);
            } else {
                console.log(`⚠️  Reminder logged but email failed: "${task.title}"`);
            }
        }

        res.status(200).json({
            message: `${reminders.length} reminder(s) processed`,
            reminders
        });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};


// Add comment to task
export const addComment = async (req, res) => {
    try {
        const { text } = req.body;
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        if (task.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const comment = {
            text,
            author: req.user.name,
            createdAt: new Date()
        };

        task.comments.push(comment);
        await task.save();

        res.status(200).json({ 
            message: 'Comment added',
            task 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete comment from task
export const deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        if (task.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        task.comments = task.comments.filter(c => c._id.toString() !== commentId);
        await task.save();

        res.status(200).json({ 
            message: 'Comment deleted',
            task 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

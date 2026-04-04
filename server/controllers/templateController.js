import Template from "../models/Template.js";

/**
 * Create Template
 * POST /api/templates
 * Protected Route
 */
export const createTemplate = async (req, res) => {
    try {
        const { name, title, description, priority, tags, subtasks, notes } = req.body;

        if (!name || !title) {
            return res.status(400).json({ message: "Please add a name and title" });
        }

        const template = await Template.create({
            name,
            title,
            description,
            priority: priority || "medium",
            tags: tags || [],
            subtasks: subtasks || [],
            notes: notes || "",
            user: req.user._id
        });

        res.status(201).json(template);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

/**
 * Get All Templates
 * GET /api/templates
 * Protected Route
 */
export const getTemplates = async (req, res) => {
    try {
        const templates = await Template.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json({ templates });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

/**
 * Delete Template
 * DELETE /api/templates/:id
 * Protected Route
 */
export const deleteTemplate = async (req, res) => {
    try {
        const template = await Template.findById(req.params.id);

        if (!template) {
            return res.status(404).json({ message: "Template not found" });
        }

        // Check if user owns this template
        if (template.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }

        await template.deleteOne();

        res.status(200).json({ message: "Template deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

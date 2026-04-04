import express from "express";
import { createTemplate, getTemplates, deleteTemplate } from "../controllers/templateController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createTemplate);
router.get("/", protect, getTemplates);
router.delete("/:id", protect, deleteTemplate);

export default router;

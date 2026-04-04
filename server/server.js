import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from "./routes/authRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import templateRoutes from "./routes/templateRoutes.js";
import calendarRoutes from "./routes/calendarRoutes.js";

dotenv.config();

const app = express();

//Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.log("DB Error:", err.message));

//Middleware
app.use(express.json());
app.use(cors());

// Initialize passport only if OAuth credentials are provided
if (process.env.GOOGLE_CLIENT_ID || process.env.GITHUB_CLIENT_ID) {
    import('./config/passport.js').then((passportModule) => {
        app.use(passportModule.default.initialize());
        console.log("OAuth enabled");
    }).catch(err => {
        console.log("OAuth not configured, using email/password only");
    });
}

//Test Route
app.get('/', (req, res) => {
    res.send('API is running successfully...');
});

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/templates", templateRoutes);
app.use("/api/calendar", calendarRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 
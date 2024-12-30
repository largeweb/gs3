import express from "express";
import cors from "cors";
import { settingsRouter } from "./routes/settings.js";
import { projectsRouter } from "./routes/projects.js";

const app = express();
const port = 3001;

// Enable CORS for all routes
app.use(
    cors({
        origin: "http://localhost:3000", // Your Next.js app
        methods: ["GET", "POST"],
        credentials: true,
    })
);

app.use(express.json());

// Register routes
app.use("/api/settings", settingsRouter);
app.use("/api/projects", projectsRouter);

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

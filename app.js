import express from "express";
import morgan from "morgan";
import cors from "cors";
import { connectToDatabase } from "./config/db.js";
import sequelize from "./config/db.js";

import contactsRouter from "./routes/contactsRouter.js";
import authRouter from "./routes/authRouter.js";

const app = express();

app.use(morgan("tiny"));
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/contacts", contactsRouter);

app.use((_, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  const { status = 500, message = "Server error" } = err;
  res.status(status).json({ message });
});

// Initialize database and start server
const startServer = async () => {
  try {
    // Connect to the database
    await connectToDatabase();

    // Sync models with database (create tables if they don't exist)
    await sequelize.sync();

    // Start the Express server
    app.listen(3000, () => {
      console.log("Server is running. Use our API on port: 3000");
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

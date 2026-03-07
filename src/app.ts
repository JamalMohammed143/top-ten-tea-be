import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
// import rateLimit from "express-rate-limit";
import { errorHandler } from "./middlewares/errorHandler";

const app: Application = express();

// Security Middleware
app.use(helmet());
app.use(cors());

// Rate Limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // limit each IP to 100 requests per windowMs
// });
// app.use(limiter);
// app.set("trust proxy", false);

// Body Parser & Logging
app.use(express.json());
app.use(morgan("dev"));

// Routes imports
import authRoutes from "./routes/authRoutes";
import adminRoutes from "./routes/adminRoutes";
import deliveryRoutes from "./routes/deliveryRoutes";

// Routes
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/delivery", deliveryRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("Top Ten Tea API is running");
});

// Centralized Error Handling
app.use(errorHandler);

export default app;

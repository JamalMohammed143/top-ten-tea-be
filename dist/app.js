"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
// import rateLimit from "express-rate-limit";
const errorHandler_1 = require("./middlewares/errorHandler");
const app = (0, express_1.default)();
// Security Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
// Rate Limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // limit each IP to 100 requests per windowMs
// });
// app.use(limiter);
// app.set("trust proxy", false);
// Body Parser & Logging
app.use(express_1.default.json());
app.use((0, morgan_1.default)("dev"));
// Routes imports
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const deliveryRoutes_1 = __importDefault(require("./routes/deliveryRoutes"));
// Routes
app.use("/auth", authRoutes_1.default);
app.use("/admin", adminRoutes_1.default);
app.use("/delivery", deliveryRoutes_1.default);
// Health check
app.get("/", (req, res) => {
    res.send("Top Ten Tea API is running");
});
// Centralized Error Handling
app.use(errorHandler_1.errorHandler);
exports.default = app;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Users_1 = require("../models/Users");
const AppError_1 = require("../utils/AppError");
// Generate Token
const generateToken = (id, role) => {
    return jsonwebtoken_1.default.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: (process.env.JWT_EXPIRE || "1d"),
    });
};
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return next(new AppError_1.AppError("Please provide an email and password", 400));
        }
        // Role is NOT accepted from frontend, pulled from database
        const user = await Users_1.User.findOne({ email }).select("+password");
        console.log(user, "user");
        if (!user) {
            return next(new AppError_1.AppError("Invalid credentials", 401));
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return next(new AppError_1.AppError("Invalid credentials", 401));
        }
        const token = generateToken(user.id, user.role);
        res.status(200).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;

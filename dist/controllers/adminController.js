"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTracking = exports.getAssignments = exports.createAssignment = exports.deleteUser = exports.updateUser = exports.getUsers = exports.createUser = exports.deleteProduct = exports.updateProduct = exports.getProducts = exports.createProduct = void 0;
const Product_1 = require("../models/Product");
const Users_1 = require("../models/Users");
const Assignment_1 = require("../models/Assignment");
const Sale_1 = require("../models/Sale");
const AppError_1 = require("../utils/AppError");
const mongoose_1 = __importDefault(require("mongoose"));
// =======================
// PRODUCTS CRUD
// =======================
const createProduct = async (req, res, next) => {
    try {
        const { name, price, commissionPercentage } = req.body;
        const product = await Product_1.Product.create({
            name,
            price,
            commissionPercentage,
            createdBy: req.user?._id,
        });
        res.status(201).json({ success: true, data: product });
    }
    catch (error) {
        next(error);
    }
};
exports.createProduct = createProduct;
const getProducts = async (req, res, next) => {
    try {
        const products = await Product_1.Product.find().populate("createdBy", "name email");
        res.status(200).json({ success: true, data: products });
    }
    catch (error) {
        next(error);
    }
};
exports.getProducts = getProducts;
const updateProduct = async (req, res, next) => {
    try {
        const product = await Product_1.Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!product)
            return next(new AppError_1.AppError("Product not found", 404));
        res.status(200).json({ success: true, data: product });
    }
    catch (error) {
        next(error);
    }
};
exports.updateProduct = updateProduct;
const deleteProduct = async (req, res, next) => {
    try {
        const product = await Product_1.Product.findByIdAndDelete(req.params.id);
        if (!product)
            return next(new AppError_1.AppError("Product not found", 404));
        res.status(200).json({ success: true, data: {} });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteProduct = deleteProduct;
// =======================
// USERS CRUD
// =======================
const createUser = async (req, res, next) => {
    try {
        // Password will be hashed in pre-save hook
        const user = await Users_1.User.create(req.body);
        // Remove password from response
        user.password = undefined;
        res.status(201).json({ success: true, data: user });
    }
    catch (error) {
        next(error);
    }
};
exports.createUser = createUser;
const getUsers = async (req, res, next) => {
    try {
        const users = await Users_1.User.find({ _id: { $ne: req.user?._id } });
        res.status(200).json({ success: true, data: users });
    }
    catch (error) {
        next(error);
    }
};
exports.getUsers = getUsers;
const updateUser = async (req, res, next) => {
    try {
        if (req.body.password) {
            // If updating password, we must save to trigger pre-save hook
            const user = await Users_1.User.findById(req.params.id);
            if (!user)
                return next(new AppError_1.AppError("User not found", 404));
            Object.assign(user, req.body);
            await user.save();
            user.password = undefined;
            return res.status(200).json({ success: true, data: user });
        }
        const user = await Users_1.User.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!user)
            return next(new AppError_1.AppError("User not found", 404));
        res.status(200).json({ success: true, data: user });
    }
    catch (error) {
        next(error);
    }
};
exports.updateUser = updateUser;
const deleteUser = async (req, res, next) => {
    try {
        const user = await Users_1.User.findByIdAndDelete(req.params.id);
        if (!user)
            return next(new AppError_1.AppError("User not found", 404));
        res.status(200).json({ success: true, data: {} });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteUser = deleteUser;
// =======================
// ASSIGNMENTS
// =======================
const createAssignment = async (req, res, next) => {
    try {
        const { deliveryPersonId, productId, assignedQuantity } = req.body;
        // Validate delivery person
        const dp = await Users_1.User.findOne({ _id: deliveryPersonId, role: "delivery" });
        if (!dp)
            return next(new AppError_1.AppError("Invalid delivery person", 400));
        // Validate product
        const product = await Product_1.Product.findById(productId);
        if (!product)
            return next(new AppError_1.AppError("Product not found", 404));
        const assignment = await Assignment_1.Assignment.create({
            deliveryPersonId,
            productId,
            assignedQuantity,
        });
        res.status(201).json({ success: true, data: assignment });
    }
    catch (error) {
        next(error);
    }
};
exports.createAssignment = createAssignment;
const getAssignments = async (req, res, next) => {
    try {
        const assignments = await Assignment_1.Assignment.find()
            .populate("deliveryPersonId", "name email")
            .populate("productId", "name price");
        res.status(200).json({ success: true, data: assignments });
    }
    catch (error) {
        next(error);
    }
};
exports.getAssignments = getAssignments;
// =======================
// TRACKING & AGGREGATION
// =======================
const getTracking = async (req, res, next) => {
    try {
        const { deliveryId, startDate, endDate } = req.query;
        const matchStage = {};
        if (deliveryId) {
            matchStage.deliveryPersonId = new mongoose_1.default.Types.ObjectId(deliveryId);
        }
        if (startDate || endDate) {
            matchStage.createdAt = {};
            if (startDate)
                matchStage.createdAt.$gte = new Date(startDate);
            if (endDate)
                matchStage.createdAt.$lte = new Date(endDate);
        }
        const pipeline = [
            { $match: matchStage },
            {
                $group: {
                    _id: null,
                    totalQuantitySold: { $sum: "$quantitySold" },
                    totalRevenue: { $sum: "$totalAmount" },
                    totalCommission: { $sum: "$commissionEarned" },
                    deliveries: { $push: "$$ROOT" },
                },
            },
            {
                $project: {
                    _id: 0,
                    totalQuantitySold: 1,
                    totalRevenue: 1,
                    totalCommission: 1,
                    deliveries: 1,
                },
            },
        ];
        const result = await Sale_1.Sale.aggregate(pipeline);
        if (result.length === 0) {
            return res.status(200).json({
                success: true,
                data: {
                    totalQuantitySold: 0,
                    totalRevenue: 0,
                    totalCommission: 0,
                    deliveries: [],
                },
            });
        }
        // Populate deliveries manually if needed, or return as is. The requirements say return the list of deliveries.
        // If we want populated product/user data inside `deliveries`, we either do `$lookup` in aggregation or populate here.
        // Let's stick to the basic aggregated response per requirements.
        res.status(200).json({ success: true, data: result[0] });
    }
    catch (error) {
        next(error);
    }
};
exports.getTracking = getTracking;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMySales = exports.createSale = exports.getAssignedProducts = void 0;
const Assignment_1 = require("../models/Assignment");
const Sale_1 = require("../models/Sale");
const Product_1 = require("../models/Product");
const AppError_1 = require("../utils/AppError");
const getAssignedProducts = async (req, res, next) => {
    try {
        const assignments = await Assignment_1.Assignment.find({
            deliveryPersonId: req.user?._id,
        }).populate("productId", "name price commissionPercentage");
        res.status(200).json({ success: true, data: assignments });
    }
    catch (error) {
        next(error);
    }
};
exports.getAssignedProducts = getAssignedProducts;
const createSale = async (req, res, next) => {
    try {
        const { productId, quantitySold, amountPerProduct, storeName } = req.body;
        const deliveryPersonId = req.user?._id;
        // Validate assignment
        const assignment = await Assignment_1.Assignment.findOne({
            deliveryPersonId,
            productId,
        });
        if (!assignment) {
            return next(new AppError_1.AppError("You are not assigned to sell this product", 403));
        }
        if (assignment.assignedQuantity < quantitySold) {
            return next(new AppError_1.AppError("Not enough assigned quantity to sell", 400));
        }
        // Get product to calculate commission
        const product = await Product_1.Product.findById(productId);
        if (!product) {
            return next(new AppError_1.AppError("Product not found", 404));
        }
        const totalAmount = quantitySold * amountPerProduct;
        // Commission Logic: commissionEarned = (quantitySold * amountPerProduct * commissionPercentage) / 100
        const commissionEarned = (totalAmount * 10) / 100;
        // Reduce assigned quantity
        assignment.assignedQuantity -= quantitySold;
        await assignment.save();
        // Create Sale record
        const sale = await Sale_1.Sale.create({
            deliveryPersonId,
            productId,
            quantitySold,
            amountPerProduct,
            storeName,
            totalAmount,
            commissionEarned,
        });
        res.status(201).json({ success: true, data: sale });
    }
    catch (error) {
        next(error);
    }
};
exports.createSale = createSale;
const getMySales = async (req, res, next) => {
    try {
        const sales = await Sale_1.Sale.find({ deliveryPersonId: req.user?._id }).populate("productId", "name");
        // Calculate totals
        const totals = sales.reduce((acc, sale) => {
            acc.totalSales += sale.totalAmount;
            acc.totalCommission += sale.commissionEarned;
            return acc;
        }, { totalSales: 0, totalCommission: 0 });
        res.status(200).json({
            success: true,
            data: {
                totalSales: totals.totalSales,
                totalCommission: totals.totalCommission,
                sales,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getMySales = getMySales;

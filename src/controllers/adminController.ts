import { Request, Response, NextFunction } from "express";
import { Product } from "../models/Product";
import { User } from "../models/Users";
import { Assignment } from "../models/Assignment";
import { Sale } from "../models/Sale";
import { AppError } from "../utils/AppError";
import mongoose from "mongoose";

// =======================
// PRODUCTS CRUD
// =======================

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, price, commissionPercentage } = req.body;
    const product = await Product.create({
      name,
      price,
      commissionPercentage,
      createdBy: req.user?._id,
    });
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const products = await Product.find().populate("createdBy", "name email");
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) return next(new AppError("Product not found", 404));
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return next(new AppError("Product not found", 404));
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

// =======================
// USERS CRUD
// =======================

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Password will be hashed in pre-save hook
    const user = await User.create(req.body);
    // Remove password from response
    user.password = undefined;
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const users = await User.find({ _id: { $ne: req.user?._id } });
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (req.body.password) {
      // If updating password, we must save to trigger pre-save hook
      const user = await User.findById(req.params.id);
      if (!user) return next(new AppError("User not found", 404));

      Object.assign(user, req.body);
      await user.save();
      user.password = undefined;
      return res.status(200).json({ success: true, data: user });
    }

    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!user) return next(new AppError("User not found", 404));
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return next(new AppError("User not found", 404));
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

// =======================
// ASSIGNMENTS
// =======================

export const createAssignment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { deliveryPersonId, productId, assignedQuantity } = req.body;

    // Validate delivery person
    const dp = await User.findOne({ _id: deliveryPersonId, role: "delivery" });
    if (!dp) return next(new AppError("Invalid delivery person", 400));

    // Validate product
    const product = await Product.findById(productId);
    if (!product) return next(new AppError("Product not found", 404));

    const assignment = await Assignment.create({
      deliveryPersonId,
      productId,
      assignedQuantity,
    });

    res.status(201).json({ success: true, data: assignment });
  } catch (error) {
    next(error);
  }
};

export const getAssignments = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const assignments = await Assignment.find()
      .populate("deliveryPersonId", "name email")
      .populate("productId", "name price");
    res.status(200).json({ success: true, data: assignments });
  } catch (error) {
    next(error);
  }
};

// =======================
// TRACKING & AGGREGATION
// =======================

export const getTracking = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { deliveryId, startDate, endDate } = req.query;

    const matchStage: any = {};

    if (deliveryId) {
      matchStage.deliveryPersonId = new mongoose.Types.ObjectId(
        deliveryId as string,
      );
    }

    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate as string);
      if (endDate) matchStage.createdAt.$lte = new Date(endDate as string);
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

    const result = await Sale.aggregate(pipeline);

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
  } catch (error) {
    next(error);
  }
};

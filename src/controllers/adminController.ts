import { Request, Response, NextFunction } from "express";
import { Product } from "../models/Product";
import { User } from "../models/User";
import { Assignment } from "../models/Assignment";
import { Sale } from "../models/Sale";
import { Store } from "../models/Store";
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
    const { name, productCode, price, netQuantity } = req.body;
    const product = await Product.create({
      name,
      productCode,
      price,
      netQuantity,
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
    const { userId, assignments } = req.body;

    if (!userId || !Array.isArray(assignments) || assignments.length === 0) {
      return next(new AppError("Invalid request data", 400));
    }

    // Validate delivery person
    const dp = await User.findOne({ _id: userId, role: "delivery" });
    if (!dp) return next(new AppError("Invalid delivery person", 400));

    const createdAssignments = [];

    for (const item of assignments) {
      const { productId, storeId, quantity } = item;

      // Validate product
      const product = await Product.findById(productId);
      if (!product) {
        return next(new AppError(`Product not found: ${productId}`, 404));
      }

      // Validate store
      const store = await Store.findById(storeId);
      if (!store) {
        return next(new AppError(`Store not found: ${storeId}`, 404));
      }

      const assignment = await Assignment.create({
        deliveryPersonId: userId,
        productId,
        storeId,
        assignedQuantity: quantity,
      });

      createdAssignments.push(assignment);
    }

    res.status(201).json({ success: true, data: createdAssignments });
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
      .populate("productId", "name price")
      .populate("storeId", "name storeId");
    res.status(200).json({ success: true, data: assignments });
  } catch (error) {
    next(error);
  }
};

export const getAssignmentById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate("deliveryPersonId", "name email")
      .populate("productId", "name price")
      .populate("storeId", "name storeId");

    if (!assignment) return next(new AppError("Assignment not found", 404));

    res.status(200).json({ success: true, data: assignment });
  } catch (error) {
    next(error);
  }
};

export const updateAssignment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const assignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      },
    )
      .populate("deliveryPersonId", "name email")
      .populate("productId", "name price")
      .populate("storeId", "name storeId");

    if (!assignment) return next(new AppError("Assignment not found", 404));

    res.status(200).json({ success: true, data: assignment });
  } catch (error) {
    next(error);
  }
};

export const deleteAssignment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const assignment = await Assignment.findByIdAndDelete(req.params.id);
    if (!assignment) return next(new AppError("Assignment not found", 404));

    res.status(200).json({ success: true, data: {} });
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
    const { date } = req.query;

    // Determine target date (default to today)
    const targetDate = date ? new Date(date as string) : new Date();

    // Define start and end of the day
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const sales = await Sale.find({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    })
      .populate("deliveryPersonId", "name email")
      .populate("productId", "name price")
      .populate("storeId", "name storeId");

    // Calculate totals
    const totals = sales.reduce(
      (acc, sale) => {
        acc.totalQuantitySold += sale.quantitySold;
        acc.totalRevenue += sale.totalAmount;
        acc.totalCommission += sale.commissionEarned;
        return acc;
      },
      { totalQuantitySold: 0, totalRevenue: 0, totalCommission: 0 },
    );

    res.status(200).json({
      success: true,
      data: {
        ...totals,
        deliveries: sales,
      },
    });
  } catch (error) {
    next(error);
  }
};

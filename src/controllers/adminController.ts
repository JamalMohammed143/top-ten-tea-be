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
    const { name, productCode, price, netQuantity, incentivePerPiece } =
      req.body;
    const product = await Product.create({
      name,
      productCode,
      price,
      incentivePerPiece,
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

export const getProductById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "createdBy",
      "name email",
    );
    if (!product) return next(new AppError("Product not found", 404));
    res.status(200).json({ success: true, data: product });
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
      const { productId, storeId, groupNames, quantity } = item;

      // Validate product
      const product = await Product.findById(productId);
      if (!product) {
        return next(new AppError(`Product not found: ${productId}`, 404));
      }

      // Validate store if provided
      if (storeId) {
        const store = await Store.findById(storeId);
        if (!store) {
          return next(new AppError(`Store not found: ${storeId}`, 404));
        }
      }

      const assignment = await Assignment.create({
        deliveryPersonId: userId,
        productId,
        storeId,
        groupNames,
        assignedQuantity: quantity,
        remainingQuantity: quantity,
      });

      createdAssignments.push(assignment);
    }

    const totalAssignedQuantity = createdAssignments.reduce(
      (sum, a) => sum + a.assignedQuantity,
      0,
    );

    res.status(201).json({
      success: true,
      totalAssignedQuantity,
      data: createdAssignments,
    });
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
    const assignments = await Assignment.find({ status: "active" })
      .populate("deliveryPersonId", "name email")
      .populate("productId", "name netQuantity")
      .populate("storeId", "name storeId groupName");
    const totalAssignedQuantity = assignments.reduce(
      (sum, a) => sum + a.assignedQuantity,
      0,
    );

    res.status(200).json({
      success: true,
      totalAssignedQuantity,
      data: assignments,
    });
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
      .populate("productId", "name netQuantity")
      .populate("storeId", "name storeId groupName");

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
      .populate("productId", "name netQuantity")
      .populate("storeId", "name storeId groupName");

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
      status: "active",
    })
      .populate("deliveryPersonId", "name email")
      .populate("productId", "name netQuantity")
      .populate("storeId", "name storeId");

    // Calculate totals
    const totals = sales.reduce(
      (acc, sale) => {
        acc.totalQuantitySold += sale.quantitySold || 0;
        acc.totalRevenue += sale.totalAmount || 0;
        acc.totalIncentive += sale.incentiveEarned || 0;
        return acc;
      },
      { totalQuantitySold: 0, totalRevenue: 0, totalIncentive: 0 },
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

export const getSettlementDetails = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { deliveryPersonId } = req.params;
    const { date } = req.query;

    const targetDate = date ? new Date(date as string) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // 1. Get today's assignments for this person
    const assignments = await Assignment.find({
      deliveryPersonId,
      createdAt: { $gte: startOfDay, $lte: endOfDay },
      status: "active",
    })
      .populate("productId", "name netQuantity")
      .populate("storeId", "name storeId groupName");

    // 2. Get today's sales for this person
    const sales = await Sale.find({
      deliveryPersonId,
      createdAt: { $gte: startOfDay, $lte: endOfDay },
      status: "active",
    })
      .populate("productId", "name")
      .populate("storeId", "name");

    // 3. Calculate metrics
    let totalAssignedQuantity = 0;
    let totalRemainingQuantity = 0;
    const assignedProductIds: string[] = [];
    const assignedGroupNames = new Set<string>();

    assignments.forEach((a) => {
      totalAssignedQuantity += a.assignedQuantity;
      totalRemainingQuantity += a.remainingQuantity;
      if (a.productId) assignedProductIds.push(a.productId._id.toString());
      if (a.groupNames && Array.isArray(a.groupNames)) {
        a.groupNames.forEach((gn) => assignedGroupNames.add(gn));
      } else if ((a as any).storeId?.groupName) {
        assignedGroupNames.add((a as any).storeId.groupName);
      }
    });

    let totalQuantitySold = 0;
    let totalSalesAmount = 0;
    let totalIncentive = 0;
    const visitedStoreIds = new Set<string>();

    sales.forEach((s) => {
      totalQuantitySold += s.quantitySold || 0;
      totalSalesAmount += s.totalAmount || 0;
      totalIncentive += s.incentiveEarned || 0;
      if (s.storeId) visitedStoreIds.add(s.storeId._id.toString());
    });

    const unsoldQuantity = totalRemainingQuantity;

    // // Find unvisited stores within the assigned groups
    let unvisitedStores: any[] = [];
    if (assignedGroupNames.size > 0) {
      const allStoresInGroup = await Store.find({
        groupName: { $in: Array.from(assignedGroupNames) },
      });

      unvisitedStores = allStoresInGroup.filter(
        (store) => !visitedStoreIds.has(store._id.toString()),
      );
    }

    res.status(200).json({
      success: true,
      data: {
        totalAssignedQuantity,
        totalQuantitySold,
        unsoldQuantity,
        totalSalesAmount,
        totalIncentive,
        visitedStoresCount: visitedStoreIds.size,
        unvisitedStoresCount: unvisitedStores.length,
        unvisitedStores,
        sales,
      },
    });
  } catch (error) {
    next(error);
  }
};

import { Settlement } from "../models/Settlement";

export const createSettlement = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      deliveryPersonId,
      date,
      petrolAllowance,
      totalSalesAmount,
      totalIncentive,
    } = req.body;

    const targetDate = date ? new Date(date as string) : new Date();

    // Check if settlement already exists
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingSettlement = await Settlement.findOne({
      deliveryPersonId,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    if (existingSettlement) {
      return next(
        new AppError("Settlement already created for this date.", 400),
      );
    }

    const petrolAmount = parseFloat(petrolAllowance) || 0;
    // Payout Logic: Typically Delivery agent pays admin (Sales - Incentive + Petrol Allowance) or similar,
    // Adjust logic based on exact business rule. Here finalTotal = totalSales - incentive - petrol
    const finalTotal = totalSalesAmount - totalIncentive - petrolAmount;

    const settlement = await Settlement.create({
      deliveryPersonId,
      date: targetDate,
      totalSalesAmount,
      totalIncentive,
      petrolAllowance: petrolAmount,
      finalTotal,
      status: "completed",
    });

    // Delete current assignments and sales as settlement is done
    await Assignment.deleteMany({
      deliveryPersonId,
      createdAt: { $gte: startOfDay, $lte: endOfDay },
      status: "active",
    });

    await Sale.deleteMany({
      deliveryPersonId,
      createdAt: { $gte: startOfDay, $lte: endOfDay },
      status: "active",
    });

    res.status(201).json({ success: true, data: settlement });
  } catch (error) {
    next(error);
  }
};

export const getSettlements = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const settlements = await Settlement.find()
      .populate("deliveryPersonId", "name email")
      .sort({ date: -1 })
      .lean();

    const enriched = await Promise.all(
      settlements.map(async (settlement) => {
        const settlementDate = new Date(settlement.date);
        const startOfDay = new Date(settlementDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(settlementDate);
        endOfDay.setHours(23, 59, 59, 999);

        // Fetch settled sales for this delivery person on this day
        const sales = await Sale.find({
          deliveryPersonId: settlement.deliveryPersonId,
          createdAt: { $gte: startOfDay, $lte: endOfDay },
          status: "settled",
        })
          .populate("storeId", "name storeId groupName areaName address")
          .populate("productId", "name productCode price incentivePerPiece")
          .lean();

        // Build store breakdown map
        const storeMap = new Map<string, any>();
        let totalQuantitySold = 0;

        for (const sale of sales) {
          totalQuantitySold += sale.quantitySold;
          const storeKey = String((sale.storeId as any)?._id ?? sale.storeId);

          if (!storeMap.has(storeKey)) {
            storeMap.set(storeKey, {
              store: sale.storeId,
              items: [],
              storeTotalAmount: 0,
            });
          }
          const storeEntry = storeMap.get(storeKey);
          storeEntry.items.push({
            product: sale.productId,
            quantitySold: sale.quantitySold,
            amountPerProduct: sale.amountPerProduct,
            totalAmount: sale.totalAmount,
            incentiveEarned: sale.incentiveEarned,
          });
          storeEntry.storeTotalAmount += sale.totalAmount;
        }

        // Build product summary map
        const productMap = new Map<string, any>();
        for (const sale of sales) {
          const productKey = String(
            (sale.productId as any)?._id ?? sale.productId,
          );
          if (!productMap.has(productKey)) {
            productMap.set(productKey, {
              product: sale.productId,
              totalQuantitySold: 0,
              totalAmount: 0,
              totalIncentive: 0,
            });
          }
          const productEntry = productMap.get(productKey);
          productEntry.totalQuantitySold += sale.quantitySold;
          productEntry.totalAmount += sale.totalAmount;
          productEntry.totalIncentive += sale.incentiveEarned;
        }

        return {
          ...settlement,
          deliveryPerson: settlement.deliveryPersonId,
          totalQuantitySold,
          storesVisited: storeMap.size,
          storeBreakdown: Array.from(storeMap.values()),
          productSummary: Array.from(productMap.values()),
        };
      }),
    );

    res.status(200).json({ success: true, data: enriched });
  } catch (error) {
    next(error);
  }
};

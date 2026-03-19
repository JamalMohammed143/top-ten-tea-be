import { Request, Response, NextFunction } from "express";
import { Assignment } from "../models/Assignment";
import { Sale } from "../models/Sale";
import { Product } from "../models/Product";
import { Store } from "../models/Store";
import { AppError } from "../utils/AppError";

export const getAssignedProducts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const assignments = await Assignment.find({
      deliveryPersonId: req.user?._id,
      createdAt: { $gte: startOfDay, $lte: endOfDay },
      status: "active",
    })
      .populate("productId", "name price incentivePerPiece netQuantity")
      .populate("storeId", "name storeId groupName address contactNo");

    res.status(200).json({ success: true, data: assignments });
  } catch (error) {
    next(error);
  }
};

export const createSale = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { storeId, customStoreName, address, contactNo, items } = req.body;
    const deliveryPersonId = req.user?._id;

    let finalStoreId = storeId;

    if (!finalStoreId && customStoreName) {
      if (!address || !contactNo) {
        return next(
          new AppError(
            "Address and contact number are required for new stores",
            400,
          ),
        );
      }

      // Check if store already exists by name
      let store = await Store.findOne({ name: customStoreName });

      if (!store) {
        // Create new store
        // Generate a simple storeId (e.g., S-TIMESTAMP)
        const generatedId = `S-${Date.now()}`;
        store = await Store.create({
          name: customStoreName,
          storeId: generatedId,
          address,
          contactNo,
        });
      }
      finalStoreId = store._id;
    }

    if (!finalStoreId) {
      return next(new AppError("Store information is required", 400));
    }

    // Fetch store details to match assignments by groupName if needed
    const currentStore = await Store.findById(finalStoreId);

    if (!items || !Array.isArray(items) || items.length === 0) {
      return next(new AppError("At least one product item is required", 400));
    }

    const createdSales = [];

    // Generate a unique billId for this submission
    const billId = `BILL-${Date.now()}`;

    // Process each item
    for (const item of items) {
      const { productId, quantity, amount, pricePerUnit } = item;
      console.log(productId, quantity, amount, pricePerUnit);
      // Get product to calculate commission
      const product = await Product.findById(productId);
      if (!product) {
        // Option: skip or return error for the whole request.
        // Given typically these are atomic, let's return error if any product is missing.
        return next(new AppError(`Product not found: ${productId}`, 404));
      }

      const incentiveEarned = product.incentivePerPiece * quantity;

      console.log("incentiveEarned", incentiveEarned);

      // Reduce from assignment
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      // Hierarchical search for the most relevant assignment
      let assignment = await Assignment.findOne({
        deliveryPersonId,
        productId,
        storeId: finalStoreId,
        status: "active",
        createdAt: { $gte: startOfDay, $lte: endOfDay },
      });

      if (!assignment && currentStore?.groupName) {
        assignment = await Assignment.findOne({
          deliveryPersonId,
          productId,
          groupNames: currentStore.groupName,
          status: "active",
          createdAt: { $gte: startOfDay, $lte: endOfDay },
        });
      }

      if (!assignment) {
        // General assignment (no specific store or group)
        assignment = await Assignment.findOne({
          deliveryPersonId,
          productId,
          storeId: { $exists: false },
          groupNames: { $size: 0 },
          status: "active",
          createdAt: { $gte: startOfDay, $lte: endOfDay },
        });
      }

      if (assignment) {
        assignment.assignedQuantity -= quantity;
        await assignment.save();
      }

      // Create Sale record
      const sale = await Sale.create({
        deliveryPersonId,
        productId,
        billId,
        quantitySold: quantity,
        amountPerProduct: pricePerUnit || product.price,
        storeId: finalStoreId,
        totalAmount: amount,
        incentiveEarned,
      });

      createdSales.push(sale);
    }

    res.status(201).json({ success: true, data: createdSales });
  } catch (error) {
    next(error);
  }
};

export const getMySales = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const sales = await Sale.find({ 
      deliveryPersonId: req.user?._id,
      status: "active" 
    })
      .populate("productId", "name netQuantity")
      .populate("storeId", "name")
      .sort({ createdAt: -1 });

    // Calculate totals
    const totals = sales.reduce(
      (acc, sale) => {
        acc.totalSales += sale.totalAmount || 0;
        acc.totalIncentive += sale.incentiveEarned || 0;
        return acc;
      },
      { totalSales: 0, totalIncentive: 0 },
    );

    // Group by billId
    const groupedMap = new Map();

    sales.forEach((sale: any) => {
      const bId = sale.billId;
      if (!groupedMap.has(bId)) {
        groupedMap.set(bId, {
          billId: bId,
          storeName: sale.storeId?.name || "Unknown Store",
          createdAt: sale.createdAt,
          totalAmount: 0,
          totalIncentive: 0,
          items: [],
        });
      }

      const group = groupedMap.get(bId);
      group.totalAmount += sale.totalAmount || 0;
      group.totalIncentive += sale.incentiveEarned || 0;
      group.items.push({
        productName: sale.productId?.name || "Unknown Product",
        quantitySold: sale.quantitySold || 0,
        amountPerProduct: sale.amountPerProduct || 0,
        totalAmount: sale.totalAmount || 0,
        incentiveEarned: sale.incentiveEarned || 0,
      });
    });

    res.status(200).json({
      success: true,
      data: {
        totalSales: totals.totalSales,
        totalIncentive: totals.totalIncentive,
        bills: Array.from(groupedMap.values()),
      },
    });
  } catch (error) {
    next(error);
  }
};

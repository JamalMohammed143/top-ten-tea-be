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
    const assignments = await Assignment.find({
      deliveryPersonId: req.user?._id,
    })
      .populate("productId", "name price commissionPercentage")
      .populate("storeId", "name storeId");

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
    const {
      productId,
      quantity,
      amount,
      storeId,
      customStoreName,
      address,
      contactNo,
    } = req.body;
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

    // Validate assignment
    /* const assignment = await Assignment.findOne({
      deliveryPersonId,
      productId,
    });
    if (!assignment) {
      return next(
        new AppError("You are not assigned to sell this product", 403),
      );
    }

    if (assignment.assignedQuantity < quantitySold) {
      return next(new AppError("Not enough assigned quantity to sell", 400));
    } */

    // Get product to calculate commission
    const product = await Product.findById(productId);
    if (!product) {
      return next(new AppError("Product not found", 404));
    }

    const quantitySold = quantity;
    // const totalAmount = quantitySold * amountPerProduct;
    const totalAmount = amount;
    // Commission Logic: commissionEarned = (quantitySold * amountPerProduct * commissionPercentage) / 100
    const commissionEarned = (amount * 10) / 100;

    // Reduce assigned quantity
    // assignment.assignedQuantity -= quantitySold;
    // await assignment.save();

    // Create Sale record
    const sale = await Sale.create({
      deliveryPersonId,
      productId,
      quantitySold,
      amountPerProduct: product.price,
      storeId: finalStoreId,
      totalAmount,
      commissionEarned,
    });

    res.status(201).json({ success: true, data: sale });
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
    const sales = await Sale.find({ deliveryPersonId: req.user?._id })
      .populate("productId", "name")
      .populate("storeId", "name");

    // Calculate totals
    const totals = sales.reduce(
      (acc, sale) => {
        acc.totalSales += sale.totalAmount;
        acc.totalCommission += sale.commissionEarned;
        return acc;
      },
      { totalSales: 0, totalCommission: 0 },
    );

    res.status(200).json({
      success: true,
      data: {
        totalSales: totals.totalSales,
        totalCommission: totals.totalCommission,
        sales,
      },
    });
  } catch (error) {
    next(error);
  }
};

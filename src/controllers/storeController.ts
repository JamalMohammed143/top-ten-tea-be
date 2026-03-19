import { Request, Response, NextFunction } from "express";
import { Store } from "../models/Store";
import { Assignment } from "../models/Assignment";
import { AppError } from "../utils/AppError";
import mongoose from "mongoose";

export const createStore = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, storeId, groupName, areaName, address, contactNo, message } =
      req.body;
    const store = await Store.create({
      name,
      storeId,
      groupName,
      areaName,
      address,
      contactNo,
      message,
    });
    res.status(201).json({ success: true, data: store });
  } catch (error) {
    next(error);
  }
};

export const getStores = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { groupName } = req.query;
    let query: any = groupName ? { groupName: groupName as string } : {};

    // If delivery person, only show stores from assigned groups for today
    if (req.user?.role === "delivery") {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const assignments = await Assignment.find({
        deliveryPersonId: req.user._id,
        createdAt: { $gte: startOfDay, $lte: endOfDay },
        status: "active",
      });

      const assignedGroupNames = new Set<string>();
      assignments.forEach((a: any) => {
        if (a.groupNames && Array.isArray(a.groupNames)) {
          a.groupNames.forEach((gn: string) => assignedGroupNames.add(gn));
        }
      });

      // If no groups assigned, they see no stores (unless they have store-specific assignments, but those aren't handled here yet)
      // Actually, if they have store-specific assignments, those stores should also be visible.
      const assignedStoreIds = assignments
        .filter((a: any) => a.storeId)
        .map((a: any) => a.storeId);

      query = {
        $or: [
          { groupName: { $in: Array.from(assignedGroupNames) } },
          { _id: { $in: assignedStoreIds } },
        ],
      };

      // If a groupName filter was already provided in query, it must be within the assigned groups
      if (groupName) {
        query = {
          $and: [query, { groupName: groupName as string }],
        };
      }
    }

    const stores = await Store.find(query).sort({ groupName: 1 });
    res.status(200).json({ success: true, data: stores });
  } catch (error) {
    next(error);
  }
};

export const getStoreById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const store = await Store.findById(id);
    if (!store) return next(new AppError("Store not found", 404));
    res.status(200).json({ success: true, data: store });
  } catch (error) {
    next(error);
  }
};

export const updateStore = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const store = await Store.findByIdAndUpdate(id, req.body, {
      returnDocument: "after",
      runValidators: true,
    });
    if (!store) return next(new AppError("Store not found", 404));
    res.status(200).json({ success: true, data: store });
  } catch (error) {
    next(error);
  }
};

export const deleteStore = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const store = await Store.findByIdAndDelete(id);
    if (!store) return next(new AppError("Store not found", 404));
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};


export const getStoreGroups = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const groups = await Store.distinct("groupName");
    // Filter out null or empty strings if any
    const filteredGroups = groups.filter(g => g && g.trim() !== "");
    res.status(200).json({ success: true, data: filteredGroups });
  } catch (error) {
    next(error);
  }
};

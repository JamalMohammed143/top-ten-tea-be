import { Request, Response, NextFunction } from "express";
import { Store } from "../models/Store";
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
    const query = groupName ? { groupName: groupName as string } : {};
    
    const stores = await Store.find(query);
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

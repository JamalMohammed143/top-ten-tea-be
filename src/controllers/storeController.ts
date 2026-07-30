import { Request, Response, NextFunction } from "express";
import { Store } from "../models/Store";
import { Assignment } from "../models/Assignment";
import { AppError } from "../utils/AppError";

export const createStore = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, groupName, areaName, address, contactNo, message } = req.body;
    let { storeId } = req.body;

    if (!storeId || typeof storeId !== "string" || storeId.trim() === "") {
      storeId = await generateNextStoreId(groupName);
    }

    const maxRetries = 5;
    let attempts = 0;
    let store;

    while (attempts < maxRetries) {
      try {
        store = await Store.create({
          name,
          storeId,
          groupName,
          areaName,
          address,
          contactNo,
          message,
        });
        break;
      } catch (error: any) {
        const isDuplicateKey =
          error.code === 11000 &&
          ((error.keyValue && error.keyValue.storeId !== undefined) ||
            (error.message &&
              error.message.includes("dup key") &&
              error.message.includes("storeId")));

        if (isDuplicateKey && attempts < maxRetries - 1) {
          attempts++;
          storeId = await generateNextStoreId(groupName);
        } else {
          throw error;
        }
      }
    }

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
    const rawGroupNames = req.query.groupNames || req.query["groupNames[]"] || req.query.groupName;
    const { search } = req.query;

    const queryGroupNames = Array.isArray(rawGroupNames)
      ? (rawGroupNames as string[])
      : rawGroupNames
        ? [rawGroupNames as string]
        : [];

    const rawAreaNames = req.query.areaNames || req.query["areaNames[]"] || req.query.areaName;
    const queryAreaNames = Array.isArray(rawAreaNames)
      ? (rawAreaNames as string[])
      : rawAreaNames
        ? [rawAreaNames as string]
        : [];

    let query: any = {};
    if (queryGroupNames.length > 0) {
      query.groupName = { $in: queryGroupNames };
    }

    if (queryAreaNames.length > 0) {
      query.areaName = { $in: queryAreaNames };
    }

    if (search) {
      query.name = { $regex: search as string, $options: "i" };
    }

    // If delivery person, restrict their view to assigned groups/stores
    if (req.user?.role === "delivery") {
      const assignments = await Assignment.find({
        deliveryPersonId: req.user._id,
        status: "active",
      });

      const assignedGroupNames = new Set<string>();
      assignments.forEach((a: any) => {
        if (a.groupNames && Array.isArray(a.groupNames)) {
          a.groupNames.forEach((gn: string) => assignedGroupNames.add(gn));
        }
      });

      const assignedStoreIds = assignments
        .filter((a: any) => a.storeId)
        .map((a: any) => a.storeId);

      const assignedQuery = {
        $or: [
          { groupName: { $in: Array.from(assignedGroupNames) } },
          { _id: { $in: assignedStoreIds } },
        ],
      };

      const filters: any[] = [assignedQuery];

      if (queryGroupNames.length > 0) {
        filters.push({ groupName: { $in: queryGroupNames } });
      }

      if (queryAreaNames.length > 0) {
        filters.push({ areaName: { $in: queryAreaNames } });
      }

      if (search) {
        filters.push({ name: { $regex: search as string, $options: "i" } });
      }

      if (filters.length > 1) {
        query = { $and: filters };
      } else {
        query = assignedQuery;
      }
    }

    const sortField = typeof req.query.sortBy === "string" ? req.query.sortBy : "groupName";
    const sortDirection = req.query.sortOrder === "desc" ? -1 : 1;
    const sortObj: any = {};
    sortObj[sortField] = sortDirection;
    if (sortField !== "name") {
      sortObj.name = 1;
    }

    const parsedPage = parseInt(req.query.page as string, 10) || 1;
    const parsedLimit = parseInt(req.query.limit as string, 10) || 100;
    const skip = (parsedPage - 1) * parsedLimit;

    const totalCount = await Store.countDocuments(query);
    const stores = await Store.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(parsedLimit);

    res.status(200).json({
      success: true,
      data: stores,
      pagination: {
        totalCount,
        page: parsedPage,
        limit: parsedLimit,
        totalPages: Math.ceil(totalCount / parsedLimit),
      }
    });
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
    // Trim each group name and remove duplicates that may arise after trimming
    const trimmedGroups = groups
      .filter((g) => g && g.trim() !== "")
      .map((g) => g.trim());
    const uniqueGroups = Array.from(new Set(trimmedGroups));

    res.status(200).json({ success: true, data: uniqueGroups });
  } catch (error) {
    next(error);
  }
};

export const getStoreAreas = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { groupName } = req.query;
    const query: any = {};
    if (groupName && groupName !== "all" && groupName !== "") {
      query.groupName = groupName;
    }
    const areas = await Store.distinct("areaName", query);
    const trimmedAreas = areas
      .filter((a) => a && a.trim() !== "")
      .map((a) => a.trim());
    const uniqueAreas = Array.from(new Set(trimmedAreas));

    res.status(200).json({ success: true, data: uniqueAreas });
  } catch (error) {
    next(error);
  }
};

export const getNextStoreId = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const groupName = typeof req.query.groupName === "string" ? req.query.groupName.trim() : undefined;
    const nextStoreId = await generateNextStoreId(groupName);
    res.status(200).json({ success: true, data: nextStoreId });
  } catch (error) {
    next(error);
  }
};

export async function generateNextStoreId(groupName?: string): Promise<string> {
  if (groupName) {
    // Query stores within this group
    const stores = await Store.find({ groupName });
    if (stores.length > 0) {
      let maxNum = 0;
      let hasValidNum = false;
      for (const store of stores) {
        const parsed = parseStoreIdHelper(store.storeId);
        if (parsed.hasNum) {
          if (parsed.num > maxNum) {
            maxNum = parsed.num;
          }
          hasValidNum = true;
        }
      }
      if (hasValidNum) {
        return `${groupName}${maxNum + 1}`;
      }
    }

    // Fallback: check overall max number in the database, prefix with groupName
    const allStores = await Store.find({});
    let overallMaxNum = 0;
    let hasAnyNum = false;
    for (const store of allStores) {
      const parsed = parseStoreIdHelper(store.storeId);
      if (parsed.hasNum) {
        if (parsed.num > overallMaxNum) {
          overallMaxNum = parsed.num;
        }
        hasAnyNum = true;
      }
    }
    const nextNum = hasAnyNum ? overallMaxNum + 1 : 1;
    return `${groupName}${nextNum}`;
  } else {
    // No groupName provided, fetch the latest store overall by createdAt descending
    const latestStore = await Store.findOne({}).sort({ createdAt: -1 });
    if (latestStore) {
      const parsed = parseStoreIdHelper(latestStore.storeId);
      if (parsed.hasNum) {
        return `${parsed.prefix}${parsed.num + 1}`;
      } else {
        // If latest store ID doesn't have a trailing number, find overall max number
        const allStores = await Store.find({});
        let overallMaxNum = 0;
        let hasAnyNum = false;
        let prefix = parsed.prefix || "ST";
        for (const store of allStores) {
          const p = parseStoreIdHelper(store.storeId);
          if (p.hasNum) {
            if (p.num > overallMaxNum) {
              overallMaxNum = p.num;
              prefix = p.prefix || prefix;
            }
            hasAnyNum = true;
          }
        }
        const nextNum = hasAnyNum ? overallMaxNum + 1 : 1;
        return `${prefix}${nextNum}`;
      }
    }

    // Database is empty
    return "ST1";
  }
}

function parseStoreIdHelper(storeId: string): { prefix: string; num: number; hasNum: boolean } {
  if (!storeId) {
    return { prefix: "", num: 0, hasNum: false };
  }

  // Find trailing digits
  const match = storeId.match(/(\d+)$/);
  if (match) {
    const numStr = match[1];
    const num = parseInt(numStr, 10);
    const prefix = storeId.substring(0, storeId.length - numStr.length);
    return { prefix, num, hasNum: true };
  }

  return { prefix: storeId, num: 0, hasNum: false };
}

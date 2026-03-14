import { Router } from "express";
import { authenticate, authorize } from "../middlewares/authMiddleware";
import {
  createStore,
  getStores,
  getStoreById,
  updateStore,
  deleteStore,
} from "../controllers/storeController";

const router = Router();

// Apply middleware to all store routes
router.use(authenticate);
router.use(authorize("admin"));

// Store routes
router.route("/").get(getStores).post(createStore);

router.route("/:id").get(getStoreById).put(updateStore).delete(deleteStore);

export default router;

import { Router } from "express";
import { authenticate, authorize } from "../middlewares/authMiddleware";
import {
  getAssignedProducts,
  createSale,
  getMySales,
} from "../controllers/deliveryController";

const router = Router();

router.use(authenticate);
router.use(authorize("delivery"));

router.get("/assigned-products", getAssignedProducts);
router.post("/sales", createSale);
router.get("/sales/my", getMySales);

export default router;

import { Router } from "express";
import { authenticate, authorize } from "../middlewares/authMiddleware";
import {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  createUser,
  getUsers,
  updateUser,
  deleteUser,
  createAssignment,
  getAssignments,
  getTracking,
} from "../controllers/adminController";

const router = Router();

// Apply middleware to all admin routes
router.use(authenticate);
router.use(authorize("admin"));

// Products
router.route("/products").get(getProducts).post(createProduct);

router.route("/products/:id").put(updateProduct).delete(deleteProduct);

// Users
router.route("/users").get(getUsers).post(createUser);

router.route("/users/:id").put(updateUser).delete(deleteUser);

// Assignments
router.route("/assignments").get(getAssignments).post(createAssignment);

// Tracking
router.get("/tracking", getTracking);

export default router;

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
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
  getTracking,
  getSettlementDetails,
  createSettlement,
} from "../controllers/adminController";
import {
  createStore,
  getStores,
  getStoreById,
  updateStore,
  deleteStore,
  createStoresBulk,
  getStoreGroups,
} from "../controllers/storeController";

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

router
  .route("/assignments/:id")
  .get(getAssignmentById)
  .put(updateAssignment)
  .patch(updateAssignment)
  .delete(deleteAssignment);

// Tracking & Settlement
router.get("/tracking", getTracking);
router.get("/tracking/settlement/:deliveryPersonId", getSettlementDetails);
router.post("/settlements", createSettlement);

// Stores
router.get("/stores/groups", getStoreGroups);
router.post("/stores/bulk", createStoresBulk);
router.route("/stores").get(getStores).post(createStore);

router
  .route("/stores/:id")
  .get(getStoreById)
  .put(updateStore)
  .delete(deleteStore);

export default router;

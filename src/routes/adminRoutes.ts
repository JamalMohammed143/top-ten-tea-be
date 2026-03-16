import { Router } from "express";
import { authenticate, authorize } from "../middlewares/authMiddleware";
import {
  createProduct,
  getProducts,
  getProductById,
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
  getSettlements,
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

// Special case: Allow delivery users to GET stores
router.get("/stores/groups", authorize("admin", "delivery"), getStoreGroups);
router.get("/stores", authorize("admin", "delivery"), getStores);
router.get("/stores/:id", authorize("admin", "delivery"), getStoreById);

router.use(authorize("admin"));

// Products
router.route("/products").get(getProducts).post(createProduct);

router
  .route("/products/:id")
  .get(getProductById)
  .put(updateProduct)
  .delete(deleteProduct);

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
router.get("/settlements", getSettlements);
router.post("/settlements", createSettlement);

// Stores (Admin only mutations)
router.post("/stores/bulk", createStoresBulk);
router.post("/stores", createStore);

router
  .route("/stores/:id")
  .put(updateStore)
  .delete(deleteStore);

export default router;

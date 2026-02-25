"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const adminController_1 = require("../controllers/adminController");
const router = (0, express_1.Router)();
// Apply middleware to all admin routes
router.use(authMiddleware_1.authenticate);
router.use((0, authMiddleware_1.authorize)("admin"));
// Products
router.route("/products").get(adminController_1.getProducts).post(adminController_1.createProduct);
router.route("/products/:id").put(adminController_1.updateProduct).delete(adminController_1.deleteProduct);
// Users
router.route("/users").get(adminController_1.getUsers).post(adminController_1.createUser);
router.route("/users/:id").put(adminController_1.updateUser).delete(adminController_1.deleteUser);
// Assignments
router.route("/assignments").get(adminController_1.getAssignments).post(adminController_1.createAssignment);
// Tracking
router.get("/tracking", adminController_1.getTracking);
exports.default = router;

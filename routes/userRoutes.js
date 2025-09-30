const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.get("/", userController.getUsers);
router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);
router.put("/:id", userController.updateUser);
router.patch("/:id/role", userController.updateUserRole);
router.delete("/:id", userController.deleteUser);

module.exports = router;

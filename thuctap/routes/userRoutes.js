const express = require("express");

const router = express.Router();

const {
    getUsers,
    createUser,
    updateUser,
    deleteUser
} = require("../controllers/userController");

// GET tất cả User
router.get("/", getUsers);

// POST thêm User
router.post("/", createUser);

// PUT cập nhật User
router.put("/:id", updateUser);

// DELETE User
router.delete("/:id", deleteUser);

module.exports = router;
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

require("dotenv").config({
    path: path.join(__dirname, "../.env")
});

const Student = require("../models/Student");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Kết nối MongoDB
async function startServer() {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 10000
        });

        console.log("MongoDB Atlas connected");

        // Kiểm tra MongoDB có phản hồi thật không
        await mongoose.connection.db.admin().ping();
        console.log("MongoDB ping OK");

        app.listen(PORT, "0.0.0.0", () => {
            console.log(`Server running on port ${PORT}`);
        });

    } catch (error) {
        console.error("MongoDB connection error:");
        console.error(error.message);
    }
}

// GET - lấy danh sách sinh viên
app.get("/api/students", async (req, res) => {
    try {
        const students = await Student.find({});
        res.json(students);

    } catch (error) {
        console.error("GET students error:", error);

        res.status(500).json({
            message: "Lỗi lấy danh sách sinh viên",
            error: error.message
        });
    }
});

// POST - thêm sinh viên
app.post("/api/students", async (req, res) => {
    try {
        const { studentId, name, email } = req.body;

        const student = await Student.create({
            studentId,
            name,
            email
        });

        res.status(201).json(student);

    } catch (error) {
        console.error("POST student error:", error);

        res.status(500).json({
            message: "Lỗi thêm sinh viên",
            error: error.message
        });
    }
});

// PUT - cập nhật sinh viên
app.put("/api/students/:id", async (req, res) => {
    try {
        const student = await Student.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!student) {
            return res.status(404).json({
                message: "Không tìm thấy sinh viên"
            });
        }

        res.json(student);

    } catch (error) {
        console.error("PUT student error:", error);

        res.status(500).json({
            message: "Lỗi cập nhật sinh viên",
            error: error.message
        });
    }
});

// DELETE - xóa sinh viên
app.delete("/api/students/:id", async (req, res) => {
    try {
        const student = await Student.findByIdAndDelete(
            req.params.id
        );

        if (!student) {
            return res.status(404).json({
                message: "Không tìm thấy sinh viên"
            });
        }

        res.json({
            message: "Xóa sinh viên thành công"
        });

    } catch (error) {
        console.error("DELETE student error:", error);

        res.status(500).json({
            message: "Lỗi xóa sinh viên",
            error: error.message
        });
    }
});

// Khởi động server
startServer();

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

require("dotenv").config({
    path: path.join(__dirname, "../.env")
});

const Student = require("./models/Student");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// ========================================
// TRANG CHỦ BACKEND
// ========================================
app.get("/", (req, res) => {
    res.status(200).send(`
        <!DOCTYPE html>
        <html lang="vi">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">

            <title>MERN Backend - EduManage</title>

            <style>
                * {
                    box-sizing: border-box;
                }

                body {
                    margin: 0;
                    font-family: Arial, sans-serif;
                    background: #f1f5f9;
                    color: #1e293b;
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                }

                .container {
                    width: 100%;
                    max-width: 560px;
                    background: #ffffff;
                    padding: 40px;
                    border-radius: 20px;
                    box-shadow: 0 15px 45px rgba(15, 23, 42, 0.08);
                }

                .logo {
                    width: 64px;
                    height: 64px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 20px;
                    background: #e0e7ff;
                    color: #4361ee;
                    border-radius: 16px;
                    font-size: 30px;
                }

                h1 {
                    margin: 0 0 12px;
                    text-align: center;
                    font-size: 28px;
                }

                .description {
                    text-align: center;
                    color: #64748b;
                    line-height: 1.6;
                    margin-bottom: 28px;
                }

                .status {
                    padding: 15px;
                    background: #ecfdf5;
                    color: #047857;
                    border: 1px solid #a7f3d0;
                    border-radius: 12px;
                    text-align: center;
                    font-weight: bold;
                    margin-bottom: 28px;
                }

                h2 {
                    font-size: 16px;
                    margin-bottom: 14px;
                }

                .links {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .link {
                    display: block;
                    padding: 14px 18px;
                    background: #4361ee;
                    color: #ffffff;
                    text-decoration: none;
                    text-align: center;
                    border-radius: 10px;
                    font-weight: bold;
                    transition: 0.2s;
                }

                .link:hover {
                    background: #3048c5;
                    transform: translateY(-1px);
                }

                .link.secondary {
                    background: #eef2ff;
                    color: #3730a3;
                }

                .link.secondary:hover {
                    background: #e0e7ff;
                }

                .footer {
                    text-align: center;
                    color: #94a3b8;
                    font-size: 12px;
                    margin-top: 30px;
                }

                @media (max-width: 480px) {
                    .container {
                        padding: 25px 20px;
                    }

                    h1 {
                        font-size: 23px;
                    }
                }
            </style>
        </head>

        <body>
            <main class="container">

                <div class="logo">🎓</div>

                <h1>EduManage Backend</h1>

                <p class="description">
                    Hệ thống quản lý sinh viên sử dụng
                    Node.js, Express và MongoDB.
                </p>

                <div class="status">
                    ● Backend đang hoạt động
                </div>

                <h2>Kiểm tra API</h2>

                <div class="links">

                    <a class="link"
                       href="/api/hello">
                        Kiểm tra trạng thái API
                    </a>

                    <a class="link secondary"
                       href="/api/students">
                        Xem danh sách sinh viên
                    </a>

                </div>

                <div class="footer">
                    EduManage · Student Management System
                </div>

            </main>
        </body>
        </html>
    `);
});

// ========================================
// API KIỂM TRA BACKEND
// ========================================
app.get("/api/hello", (req, res) => {
    res.json({
        success: true,
        message: "Hello from backend!",
        status: "running"
    });
});

// ========================================
// GET - LẤY DANH SÁCH SINH VIÊN
// ========================================
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

// ========================================
// POST - THÊM SINH VIÊN
// ========================================
app.post("/api/students", async (req, res) => {
    try {
        const { studentId, name, email } = req.body;

        if (!studentId || !name || !email) {
            return res.status(400).json({
                message: "Vui lòng nhập đầy đủ MSSV, họ tên và email"
            });
        }

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

// ========================================
// PUT - CẬP NHẬT SINH VIÊN
// ========================================
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

// ========================================
// DELETE - XÓA SINH VIÊN
// ========================================
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

// ========================================
// KHỞI ĐỘNG SERVER VÀ KẾT NỐI MONGODB
// ========================================
async function startServer() {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error("Chưa cấu hình biến môi trường MONGODB_URI");
        }

        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 10000
        });

        console.log("MongoDB Atlas connected");

        await mongoose.connection.db.admin().ping();

        console.log("MongoDB ping OK");

        app.listen(PORT, "0.0.0.0", () => {
            console.log(`Server running on port ${PORT}`);
        });

    } catch (error) {
        console.error("Server startup error:");
        console.error(error.message);

        process.exit(1);
    }
}

startServer();
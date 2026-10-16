import { useEffect, useState } from "react";

function App() {
    const [students, setStudents] = useState([]);

    const [studentId, setStudentId] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");

    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    // Đọc phản hồi từ Backend an toàn
    const readResponse = async (response) => {
        const contentType =
            response.headers.get("content-type") || "";

        const responseText = await response.text();

        let data = {};

        if (contentType.includes("application/json")) {
            try {
                data = JSON.parse(responseText);
            } catch {
                throw new Error(
                    "Backend trả về JSON không hợp lệ."
                );
            }
        } else if (!response.ok) {
            throw new Error(
                `Lỗi HTTP ${response.status}. ` +
                "Hãy kiểm tra Backend và cấu hình Nginx."
            );
        } else {
            throw new Error(
                "API không trả về JSON. Hãy kiểm tra Backend."
            );
        }

        if (!response.ok) {
            throw new Error(
                data.error || data.message ||
                `Yêu cầu thất bại: HTTP ${response.status}`
            );
        }

        return data;
    };

    // Lấy danh sách sinh viên
    const getStudents = async () => {
        try {
            setErrorMessage("");

            const response = await fetch("/api/students");

            const data = await readResponse(response);

            if (!Array.isArray(data)) {
                throw new Error(
                    "Dữ liệu danh sách sinh viên không đúng định dạng."
                );
            }

            setStudents(data);
        } catch (error) {
            console.error(
                "Lỗi lấy danh sách sinh viên:",
                error
            );

            setErrorMessage(error.message);
        }
    };

    useEffect(() => {
        getStudents();
    }, []);

    // Xóa dữ liệu trên biểu mẫu
    const resetForm = () => {
        setStudentId("");
        setName("");
        setEmail("");
        setEditingId(null);
    };

    // Thêm hoặc cập nhật sinh viên
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!studentId.trim() ||
            !name.trim() ||
            !email.trim()) {
            alert("Vui lòng nhập đầy đủ thông tin.");
            return;
        }

        setLoading(true);
        setErrorMessage("");

        try {
            const url = editingId
                ? `/api/students/${editingId}`
                : "/api/students";

            const method = editingId ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    studentId: studentId.trim(),
                    name: name.trim(),
                    email: email.trim()
                })
            });

            await readResponse(response);

            alert(
                editingId
                    ? "Cập nhật sinh viên thành công!"
                    : "Thêm sinh viên thành công!"
            );

            resetForm();

            await getStudents();
        } catch (error) {
            console.error(
                "Lỗi thêm/cập nhật sinh viên:",
                error
            );

            setErrorMessage(error.message);

            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Chọn sinh viên để sửa
    const handleEdit = (student) => {
        setEditingId(student._id);
        setStudentId(student.studentId || "");
        setName(student.name || "");
        setEmail(student.email || "");

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    // Hủy sửa
    const handleCancel = () => {
        resetForm();
        setErrorMessage("");
    };

    // Xóa sinh viên
    const handleDelete = async (id) => {
        const confirmDelete = window.confirm(
            "Bạn có chắc muốn xóa sinh viên này không?"
        );

        if (!confirmDelete) {
            return;
        }

        setErrorMessage("");

        try {
            const response = await fetch(
                `/api/students/${id}`,
                {
                    method: "DELETE"
                }
            );

            await readResponse(response);

            alert("Xóa sinh viên thành công!");

            await getStudents();
        } catch (error) {
            console.error(
                "Lỗi xóa sinh viên:",
                error
            );

            setErrorMessage(error.message);

            alert(error.message);
        }
    };

    // Giao diện
    return (
        <div
            style={{
                padding: "30px",
                maxWidth: "1000px",
                margin: "0 auto",
                color: "white",
                fontFamily: "Arial, sans-serif"
            }}
        >
            <h1 style={{ textAlign: "center" }}>
                QUẢN LÝ SINH VIÊN
            </h1>

            <h2 style={{ textAlign: "center" }}>
                {editingId
                    ? "Cập nhật sinh viên"
                    : "Thêm sinh viên"}
            </h2>

            {errorMessage && (
                <div
                    style={{
                        padding: "12px",
                        marginBottom: "20px",
                        color: "#ffb4b4",
                        backgroundColor: "#401c1c",
                        border: "1px solid #ff6666",
                        borderRadius: "6px"
                    }}
                >
                    <strong>Lỗi:</strong> {errorMessage}
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "18px"
                }}
            >
                <div>
                    <label htmlFor="studentId">
                        MSSV:{" "}
                    </label>

                    <input
                        id="studentId"
                        type="text"
                        value={studentId}
                        onChange={(e) =>
                            setStudentId(e.target.value)
                        }
                        placeholder="Nhập MSSV"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="name">
                        Họ tên:{" "}
                    </label>

                    <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) =>
                            setName(e.target.value)
                        }
                        placeholder="Nhập họ tên"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="email">
                        Email:{" "}
                    </label>

                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) =>
                            setEmail(e.target.value)
                        }
                        placeholder="Nhập email"
                        required
                    />
                </div>

                <div>
                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Đang xử lý..."
                            : editingId
                                ? "Cập nhật sinh viên"
                                : "Thêm sinh viên"}
                    </button>

                    {editingId && (
                        <button
                            type="button"
                            onClick={handleCancel}
                            disabled={loading}
                            style={{ marginLeft: "10px" }}
                        >
                            Hủy
                        </button>
                    )}
                </div>
            </form>

            <hr style={{ margin: "25px 0" }} />

            <h2 style={{ textAlign: "center" }}>
                Danh sách sinh viên
            </h2>

            {students.length === 0 ? (
                <p style={{ textAlign: "center" }}>
                    Chưa có sinh viên hoặc chưa tải được dữ liệu.
                </p>
            ) : (
                students.map((student) => (
                    <div
                        key={student._id}
                        style={{
                            padding: "15px",
                            marginBottom: "15px",
                            border: "1px solid #555",
                            borderRadius: "8px"
                        }}
                    >
                        <p>
                            <strong>MSSV:</strong>{" "}
                            {student.studentId}
                        </p>

                        <p>
                            <strong>Họ tên:</strong>{" "}
                            {student.name}
                        </p>

                        <p>
                            <strong>Email:</strong>{" "}
                            {student.email}
                        </p>

                        <button
                            type="button"
                            onClick={() =>
                                handleEdit(student)
                            }
                        >
                            Sửa
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                handleDelete(student._id)
                            }
                            style={{ marginLeft: "10px" }}
                        >
                            Xóa
                        </button>
                    </div>
                ))
            )}
        </div>
    );
}

export default App;
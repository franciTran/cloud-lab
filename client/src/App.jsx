import { useEffect, useState } from "react";

function App() {
    const [students, setStudents] = useState([]);

    const [studentId, setStudentId] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");

    const [editingId, setEditingId] = useState(null);

    // Lấy danh sách sinh viên
    const getStudents = async () => {
        try {
            const response = await fetch("/api/students");
            const data = await response.json();

            setStudents(data);
        } catch (error) {
            console.error("Lỗi lấy danh sách:", error);
        }
    };

    useEffect(() => {
        getStudents();
    }, []);

    // Thêm hoặc cập nhật sinh viên
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const url = editingId
                ? `/api/students/${editingId}`
                : "/api/students";

            const method = editingId ? "PUT" : "POST";

            const response = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    studentId,
                    name,
                    email
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Không thể thực hiện"
                );
            }

            alert(
                editingId
                    ? "Cập nhật sinh viên thành công!"
                    : "Thêm sinh viên thành công!"
            );

            setStudentId("");
            setName("");
            setEmail("");
            setEditingId(null);

            getStudents();

        } catch (error) {
            console.error("Lỗi:", error);
            alert(error.message);
        }
    };

    // Chọn sinh viên để sửa
    const handleEdit = (student) => {
        setEditingId(student._id);
        setStudentId(student.studentId);
        setName(student.name);
        setEmail(student.email);
    };

    // Hủy sửa
    const handleCancel = () => {
        setEditingId(null);
        setStudentId("");
        setName("");
        setEmail("");
    };

    // Xóa sinh viên
    const handleDelete = async (id) => {
        const confirmDelete = window.confirm(
            "Bạn có chắc muốn xóa sinh viên này không?"
        );

        if (!confirmDelete) {
            return;
        }

        try {
            const response = await fetch(
                `/api/students/${id}`,
                {
                    method: "DELETE"
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Không thể xóa sinh viên"
                );
            }

            alert("Xóa sinh viên thành công!");

            getStudents();

        } catch (error) {
            console.error("Lỗi xóa:", error);
            alert(error.message);
        }
    };

    return (
        <div style={{ padding: "30px" }}>

            <h1>QUẢN LÝ SINH VIÊN</h1>

            <h2>
                {editingId
                    ? "Cập nhật sinh viên"
                    : "Thêm sinh viên"}
            </h2>

            <form onSubmit={handleSubmit}>

                <div>
                    <label>MSSV: </label>

                    <input
                        type="text"
                        value={studentId}
                        onChange={(e) =>
                            setStudentId(e.target.value)
                        }
                        placeholder="Nhập MSSV"
                        required
                    />
                </div>

                <br />

                <div>
                    <label>Họ tên: </label>

                    <input
                        type="text"
                        value={name}
                        onChange={(e) =>
                            setName(e.target.value)
                        }
                        placeholder="Nhập họ tên"
                        required
                    />
                </div>

                <br />

                <div>
                    <label>Email: </label>

                    <input
                        type="email"
                        value={email}
                        onChange={(e) =>
                            setEmail(e.target.value)
                        }
                        placeholder="Nhập email"
                        required
                    />
                </div>

                <br />

                <button type="submit">
                    {editingId
                        ? "Cập nhật sinh viên"
                        : "Thêm sinh viên"}
                </button>

                {editingId && (
                    <button
                        type="button"
                        onClick={handleCancel}
                        style={{ marginLeft: "10px" }}
                    >
                        Hủy
                    </button>
                )}

            </form>

            <hr />

            <h2>Danh sách sinh viên</h2>

            {students.map((student) => (
                <div key={student._id}>

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
                        onClick={() =>
                            handleEdit(student)
                        }
                    >
                        Sửa
                    </button>

                    <button
                        onClick={() =>
                            handleDelete(student._id)
                        }
                        style={{ marginLeft: "10px" }}
                    >
                        Xóa
                    </button>

                    <hr />

                </div>
            ))}

        </div>
    );
}

export default App;
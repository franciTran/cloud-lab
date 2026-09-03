import { useEffect, useState } from "react";

function App() {
    const [students, setStudents] = useState([]);

    const [studentId, setStudentId] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");

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

    // Thêm sinh viên
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch("/api/students", {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    studentId: studentId,
                    name: name,
                    email: email
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Không thể thêm sinh viên"
                );
            }

            alert("Thêm sinh viên thành công!");

            setStudentId("");
            setName("");
            setEmail("");

            getStudents();

        } catch (error) {
            console.error("Lỗi thêm sinh viên:", error);

            alert("Thêm sinh viên thất bại!");
        }
    };

    return (
        <div style={{ padding: "30px" }}>

            <h1>QUẢN LÝ SINH VIÊN</h1>

            <h2>Thêm sinh viên</h2>

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
                            setEmail(e.target.value)}
                        placeholder="Nhập email"
                        required
                    />
                </div>

                <br />

                <button type="submit">
                    Thêm sinh viên
                </button>

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

                    <hr />

                </div>
            ))}

        </div>
    );
}

export default App;
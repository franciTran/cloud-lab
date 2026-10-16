import { useEffect, useMemo, useState } from "react";
import "./App.css";

const Icon = ({ name, size = 20 }) => {
    const common = {
        width: size,
        height: size,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 1.8,
        strokeLinecap: "round",
        strokeLinejoin: "round",
        "aria-hidden": true,
    };

    const paths = {
        grid: (
            <>
                <rect x="3" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" />
            </>
        ),
        users: (
            <>
                <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="10" cy="7" r="4" />
                <path d="M20 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </>
        ),
        search: (
            <>
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-4-4" />
            </>
        ),
        plus: (
            <>
                <path d="M12 5v14" />
                <path d="M5 12h14" />
            </>
        ),
        edit: (
            <>
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L9 17l-4 1 1-4Z" />
            </>
        ),
        trash: (
            <>
                <path d="M3 6h18" />
                <path d="M8 6V4h8v2" />
                <path d="m19 6-1 14H6L5 6" />
                <path d="M10 11v5M14 11v5" />
            </>
        ),
        close: (
            <>
                <path d="m18 6-12 12" />
                <path d="m6 6 12 12" />
            </>
        ),
        mail: (
            <>
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m3 7 9 6 9-6" />
            </>
        ),
        graduation: (
            <>
                <path d="m2 10 10-5 10 5-10 5Z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
                <path d="M22 10v6" />
            </>
        ),
        check: <path d="m5 12 4 4L19 6" />,
        alert: (
            <>
                <path d="M12 3 2.5 20h19Z" />
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
            </>
        ),
        arrow: (
            <>
                <path d="M7 17 17 7" />
                <path d="M7 7h10v10" />
            </>
        ),
    };

    return <svg {...common}>{paths[name] || paths.grid}</svg>;
};

const emptyForm = {
    studentId: "",
    name: "",
    email: "",
};

function App() {
    const [students, setStudents] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);

    const [search, setSearch] = useState("");
    const [modalOpen, setModalOpen] = useState(false);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [apiOnline, setApiOnline] = useState(false);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState(null);

    const [page, setPage] = useState(1);
    const pageSize = 7;

    // Đọc phản hồi an toàn để tránh lỗi JSON khi server trả về HTML.
    const readResponse = async (response) => {
        const text = await response.text();

        let data = {};

        if (text) {
            try {
                data = JSON.parse(text);
            } catch {
                data = { error: text };
            }
        }

        if (!response.ok) {
            throw new Error(
                data.error ||
                `Lỗi HTTP ${response.status}. Vui lòng kiểm tra Backend.`
            );
        }

        return data;
    };

    // Lấy danh sách sinh viên từ Backend.
    const getStudents = async () => {
        setLoading(true);
        setError("");

        try {
            const response = await fetch("/api/students", {
                headers: {
                    Accept: "application/json",
                },
            });

            const data = await readResponse(response);

            if (!Array.isArray(data)) {
                throw new Error(
                    "Dữ liệu từ máy chủ không đúng định dạng."
                );
            }

            setStudents(data);
            setApiOnline(true);
        } catch (err) {
            setApiOnline(false);
            setError(err.message || "Không thể tải danh sách sinh viên.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getStudents();
    }, []);

    // Tìm kiếm theo MSSV, họ tên hoặc email.
    const filteredStudents = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        if (!keyword) return students;

        return students.filter((student) => {
            return [
                student.studentId,
                student.name,
                student.email,
            ].some((value) =>
                String(value || "").toLowerCase().includes(keyword)
            );
        });
    }, [students, search]);

    const totalPages = Math.max(
        1,
        Math.ceil(filteredStudents.length / pageSize)
    );

    const currentPage = Math.min(page, totalPages);

    const paginatedStudents = filteredStudents.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    // Mở form thêm mới.
    const openAddModal = () => {
        setEditingId(null);
        setForm(emptyForm);
        setError("");
        setNotice(null);
        setModalOpen(true);
    };

    // Mở form cập nhật.
    const openEditModal = (student) => {
        setEditingId(student._id);

        setForm({
            studentId: student.studentId || "",
            name: student.name || "",
            email: student.email || "",
        });

        setError("");
        setNotice(null);
        setModalOpen(true);
    };

    const closeModal = () => {
        if (saving) return;

        setModalOpen(false);
        setEditingId(null);
        setForm(emptyForm);
    };

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    // Thêm hoặc cập nhật sinh viên.
    const handleSubmit = async (event) => {
        event.preventDefault();

        if (saving) return;

        const studentId = form.studentId.trim();
        const name = form.name.trim();
        const email = form.email.trim();

        if (!studentId || !name || !email) {
            setError("Vui lòng nhập đầy đủ thông tin.");
            return;
        }

        setSaving(true);
        setError("");

        try {
            const url = editingId
                ? `/api/students/${editingId}`
                : "/api/students";

            const response = await fetch(url, {
                method: editingId ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    studentId,
                    name,
                    email,
                }),
            });

            await readResponse(response);

            setModalOpen(false);
            setEditingId(null);
            setForm(emptyForm);

            setNotice({
                type: "success",
                message: editingId
                    ? "Cập nhật sinh viên thành công."
                    : "Thêm sinh viên thành công.",
            });

            await getStudents();
        } catch (err) {
            setError(err.message || "Không thể lưu thông tin sinh viên.");
        } finally {
            setSaving(false);
        }
    };

    // Xóa sinh viên.
    const handleDelete = async (student) => {
        const confirmed = window.confirm(
            `Bạn có chắc muốn xóa sinh viên ${student.name} (${student.studentId}) không?`
        );

        if (!confirmed) return;

        setError("");
        setNotice(null);

        try {
            const response = await fetch(
                `/api/students/${student._id}`,
                {
                    method: "DELETE",
                    headers: {
                        Accept: "application/json",
                    },
                }
            );

            await readResponse(response);

            setNotice({
                type: "success",
                message: "Đã xóa sinh viên thành công.",
            });

            await getStudents();
        } catch (err) {
            setError(err.message || "Không thể xóa sinh viên.");
        }
    };

    const firstItem =
        filteredStudents.length === 0
            ? 0
            : (currentPage - 1) * pageSize + 1;

    const lastItem = Math.min(
        currentPage * pageSize,
        filteredStudents.length
    );

    return (
        <div className="app-shell">
            <aside className="sidebar">
                <a className="brand" href="#overview">
                    <span className="brand-logo">
                        <Icon name="graduation" size={25} />
                    </span>

                    <span className="brand-text">
                        <strong>EduManage</strong>
                        <small>STUDENT PORTAL</small>
                    </span>
                </a>

                <div className="sidebar-label">MENU CHÍNH</div>

                <nav className="sidebar-nav">
                    <a className="nav-item" href="#overview">
                        <Icon name="grid" />
                        <span>Tổng quan</span>
                    </a>

                    <a className="nav-item active" href="#students">
                        <Icon name="users" />
                        <span>Quản lý sinh viên</span>
                        <span className="nav-indicator" />
                    </a>
                </nav>

                <div className="sidebar-bottom">
                    <div className="sidebar-help-icon">
                        <Icon name="graduation" size={22} />
                    </div>

                    <strong>Quản lý hiệu quả</strong>

                    <p>
                        Hệ thống quản lý thông tin sinh viên tập trung,
                        thuận tiện và dễ sử dụng.
                    </p>
                </div>

                <div className="sidebar-footer">
                    <span className="avatar">AD</span>

                    <div className="profile-info">
                        <strong>Quản trị viên</strong>
                        <small>Student Management</small>
                    </div>
                </div>
            </aside>

            <main className="main-content">
                <header className="topbar">
                    <div className="breadcrumb">
                        <span>Trang chủ</span>
                        <span className="breadcrumb-divider">/</span>
                        <strong>Quản lý sinh viên</strong>
                    </div>

                    <div className="topbar-right">
                        <span
                            className={`connection-badge ${
                                apiOnline ? "online" : "offline"
                            }`}
                        >
                            <span className="connection-dot" />
                            {apiOnline
                                ? "API đang hoạt động"
                                : "API chưa kết nối"}
                        </span>

                        <span className="topbar-avatar">AD</span>
                    </div>
                </header>

                <div className="page-container">
                    <section id="overview" className="page-heading">
                        <div>
                            <div className="eyebrow">
                                STUDENT MANAGEMENT SYSTEM
                            </div>

                            <h1>Quản lý sinh viên</h1>

                            <p>
                                Quản lý thông tin và hồ sơ sinh viên
                                của bạn tại một nơi.
                            </p>
                        </div>

                        <button
                            className="button button-primary"
                            onClick={openAddModal}
                        >
                            <Icon name="plus" size={19} />
                            Thêm sinh viên
                        </button>
                    </section>

                    {notice && (
                        <div
                            className={`notice notice-${notice.type}`}
                            role="status"
                        >
                            <Icon name="check" size={19} />
                            <span>{notice.message}</span>

                            <button
                                className="notice-close"
                                onClick={() => setNotice(null)}
                                aria-label="Đóng thông báo"
                            >
                                <Icon name="close" size={17} />
                            </button>
                        </div>
                    )}

                    {error && (
                        <div className="notice notice-error" role="alert">
                            <Icon name="alert" size={19} />
                            <span>{error}</span>

                            <button
                                className="notice-close"
                                onClick={() => setError("")}
                                aria-label="Đóng thông báo"
                            >
                                <Icon name="close" size={17} />
                            </button>
                        </div>
                    )}

                    <section className="stats-grid">
                        <article className="stat-card">
                            <div className="stat-top">
                                <span className="stat-icon icon-blue">
                                    <Icon name="users" size={23} />
                                </span>

                                <span className="stat-caption">
                                    DỮ LIỆU THỰC TẾ
                                </span>
                            </div>

                            <div className="stat-number">
                                {loading ? "—" : students.length}
                            </div>

                            <div className="stat-description">
                                Tổng số sinh viên
                            </div>

                            <div className="stat-bottom">
                                Tổng số bản ghi từ cơ sở dữ liệu
                            </div>
                        </article>

                        <article className="stat-card">
                            <div className="stat-top">
                                <span className="stat-icon icon-green">
                                    <Icon name="check" size={23} />
                                </span>

                                <span className="stat-caption">
                                    TRẠNG THÁI
                                </span>
                            </div>

                            <div className="stat-status">
                                <span
                                    className={`connection-dot ${
                                        apiOnline ? "dot-green" : "dot-red"
                                    }`}
                                />

                                {apiOnline ? "Đang hoạt động" : "Chưa kết nối"}
                            </div>

                            <div className="stat-description">
                                Kết nối Backend
                            </div>

                            <div className="stat-bottom">
                                API quản lý dữ liệu sinh viên
                            </div>
                        </article>

                        <article className="stat-card">
                            <div className="stat-top">
                                <span className="stat-icon icon-purple">
                                    <Icon name="graduation" size={23} />
                                </span>

                                <span className="stat-caption">
                                    DANH SÁCH
                                </span>
                            </div>

                            <div className="stat-number">
                                {loading ? "—" : filteredStudents.length}
                            </div>

                            <div className="stat-description">
                                Kết quả hiện tại
                            </div>

                            <div className="stat-bottom">
                                {search
                                    ? "Số sinh viên khớp tìm kiếm"
                                    : "Tổng số sinh viên trong danh sách"}
                            </div>
                        </article>
                    </section>

                    <section id="students" className="table-card">
                        <div className="table-card-header">
                            <div>
                                <h2>Danh sách sinh viên</h2>
                                <p>
                                    Theo dõi và quản lý thông tin sinh viên
                                    trong hệ thống.
                                </p>
                            </div>

                            <button
                                className="button button-primary button-small"
                                onClick={openAddModal}
                            >
                                <Icon name="plus" size={17} />
                                Thêm mới
                            </button>
                        </div>

                        <div className="table-toolbar">
                            <div className="search-box">
                                <Icon name="search" size={19} />

                                <input
                                    type="search"
                                    value={search}
                                    onChange={(event) => {
                                        setSearch(event.target.value);
                                        setPage(1);
                                    }}
                                    placeholder="Tìm theo MSSV, họ tên hoặc email..."
                                    aria-label="Tìm kiếm sinh viên"
                                />

                                {search && (
                                    <button
                                        className="search-clear"
                                        onClick={() => setSearch("")}
                                        aria-label="Xóa từ khóa tìm kiếm"
                                    >
                                        <Icon name="close" size={17} />
                                    </button>
                                )}
                            </div>

                            <button
                                className="button button-outline"
                                onClick={getStudents}
                                disabled={loading}
                            >
                                <span className={loading ? "spin" : ""}>
                                    ↻
                                </span>
                                Làm mới
                            </button>
                        </div>

                        <div className="table-responsive">
                            <table className="students-table">
                                <thead>
                                    <tr>
                                        <th>MÃ SINH VIÊN</th>
                                        <th>HỌ VÀ TÊN</th>
                                        <th>ĐỊA CHỈ EMAIL</th>
                                        <th className="actions-heading">
                                            THAO TÁC
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td
                                                colSpan="4"
                                                className="empty-cell"
                                            >
                                                <div className="loading-indicator" />
                                                <p>
                                                    Đang tải dữ liệu sinh viên...
                                                </p>
                                            </td>
                                        </tr>
                                    ) : paginatedStudents.length > 0 ? (
                                        paginatedStudents.map(
                                            (student, index) => (
                                                <tr key={student._id}>
                                                    <td>
                                                        <span className="student-code">
                                                            {student.studentId}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        <div className="student-name-cell">
                                                            <span
                                                                className={`student-avatar avatar-color-${
                                                                    index % 5
                                                                }`}
                                                            >
                                                                {(
                                                                    student.name ||
                                                                    "S"
                                                                )
                                                                    .trim()
                                                                    .charAt(0)
                                                                    .toUpperCase()}
                                                            </span>

                                                            <strong>
                                                                {student.name}
                                                            </strong>
                                                        </div>
                                                    </td>

                                                    <td>
                                                        <span className="email-cell">
                                                            <Icon
                                                                name="mail"
                                                                size={16}
                                                            />

                                                            {student.email}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        <div className="action-buttons">
                                                            <button
                                                                className="icon-button edit-button"
                                                                onClick={() =>
                                                                    openEditModal(
                                                                        student
                                                                    )
                                                                }
                                                                title="Sửa thông tin"
                                                                aria-label={`Sửa ${student.name}`}
                                                            >
                                                                <Icon
                                                                    name="edit"
                                                                    size={17}
                                                                />
                                                            </button>

                                                            <button
                                                                className="icon-button delete-button"
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        student
                                                                    )
                                                                }
                                                                title="Xóa sinh viên"
                                                                aria-label={`Xóa ${student.name}`}
                                                            >
                                                                <Icon
                                                                    name="trash"
                                                                    size={17}
                                                                />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        )
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan="4"
                                                className="empty-cell"
                                            >
                                                <div className="empty-icon">
                                                    <Icon
                                                        name="users"
                                                        size={30}
                                                    />
                                                </div>

                                                <strong>
                                                    {search
                                                        ? "Không tìm thấy sinh viên"
                                                        : "Chưa có dữ liệu sinh viên"}
                                                </strong>

                                                <p>
                                                    {search
                                                        ? "Thử tìm kiếm bằng từ khóa khác."
                                                        : "Thêm sinh viên đầu tiên để bắt đầu quản lý."}
                                                </p>

                                                {!search && (
                                                    <button
                                                        className="button button-primary button-small"
                                                        onClick={openAddModal}
                                                    >
                                                        <Icon
                                                            name="plus"
                                                            size={16}
                                                        />
                                                        Thêm sinh viên
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="table-footer">
                            <span>
                                Hiển thị{" "}
                                <strong>{firstItem}–{lastItem}</strong>{" "}
                                trong tổng số{" "}
                                <strong>{filteredStudents.length}</strong>{" "}
                                sinh viên
                            </span>

                            <div className="pagination">
                                <button
                                    className="page-button"
                                    disabled={currentPage <= 1 || loading}
                                    onClick={() =>
                                        setPage((previous) => previous - 1)
                                    }
                                    aria-label="Trang trước"
                                >
                                    ‹
                                </button>

                                <span className="page-current">
                                    {currentPage}
                                </span>

                                <span className="page-total">
                                    / {totalPages}
                                </span>

                                <button
                                    className="page-button"
                                    disabled={
                                        currentPage >= totalPages || loading
                                    }
                                    onClick={() =>
                                        setPage((previous) => previous + 1)
                                    }
                                    aria-label="Trang tiếp theo"
                                >
                                    ›
                                </button>
                            </div>
                        </div>
                    </section>

                    <footer className="page-footer">
                        <span>EduManage · Student Management System</span>
                        <span>Powered by React &amp; MongoDB</span>
                    </footer>
                </div>
            </main>

            {modalOpen && (
                <div
                    className="modal-overlay"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            closeModal();
                        }
                    }}
                >
                    <section
                        className="modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="modal-title"
                    >
                        <div className="modal-header">
                            <div>
                                <div className="modal-icon">
                                    <Icon
                                        name={
                                            editingId ? "edit" : "users"
                                        }
                                        size={22}
                                    />
                                </div>

                                <h2 id="modal-title">
                                    {editingId
                                        ? "Cập nhật sinh viên"
                                        : "Thêm sinh viên mới"}
                                </h2>

                                <p>
                                    {editingId
                                        ? "Cập nhật thông tin sinh viên trong hệ thống."
                                        : "Nhập đầy đủ thông tin để thêm sinh viên vào hệ thống."}
                                </p>
                            </div>

                            <button
                                className="modal-close"
                                onClick={closeModal}
                                disabled={saving}
                                aria-label="Đóng biểu mẫu"
                            >
                                <Icon name="close" size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                {error && (
                                    <div
                                        className="form-error"
                                        role="alert"
                                    >
                                        <Icon name="alert" size={18} />
                                        {error}
                                    </div>
                                )}

                                <div className="form-group">
                                    <label htmlFor="studentId">
                                        Mã số sinh viên
                                        <span className="required">*</span>
                                    </label>

                                    <input
                                        id="studentId"
                                        name="studentId"
                                        type="text"
                                        value={form.studentId}
                                        onChange={handleChange}
                                        placeholder="Ví dụ: 236429"
                                        autoComplete="off"
                                        required
                                        autoFocus
                                    />

                                    <small>
                                        Nhập mã số sinh viên theo quy định
                                        của trường.
                                    </small>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="name">
                                        Họ và tên
                                        <span className="required">*</span>
                                    </label>

                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        value={form.name}
                                        onChange={handleChange}
                                        placeholder="Nhập họ và tên"
                                        autoComplete="name"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="email">
                                        Địa chỉ email
                                        <span className="required">*</span>
                                    </label>

                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        placeholder="sinhvien@example.com"
                                        autoComplete="email"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="button button-outline"
                                    onClick={closeModal}
                                    disabled={saving}
                                >
                                    Hủy bỏ
                                </button>

                                <button
                                    type="submit"
                                    className="button button-primary"
                                    disabled={saving}
                                >
                                    {saving ? (
                                        "Đang lưu..."
                                    ) : (
                                        <>
                                            <Icon
                                                name="check"
                                                size={18}
                                            />
                                            {editingId
                                                ? "Lưu thay đổi"
                                                : "Thêm sinh viên"}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            )}
        </div>
    );
}

export default App;
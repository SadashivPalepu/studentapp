import React, { useEffect, useState, useCallback } from "react";
import "./App.css";

const BASE_URL = "https://studentapi-d9xy.onrender.com";

const emptyStudent = {
  id: null,
  name: "",
  phoneNo: "",
  courses: [{ courseId: "", courseName: "" }]
};

function App() {
  const [allStudents, setAllStudents] = useState([]);
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState(emptyStudent);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState({
    name: "",
    phoneNo: "",
    courseName: ""
  });

  // Load ALL students once on mount
  useEffect(() => {
    loadAllStudents();
  }, []);

  // Filter students whenever search changes
  useEffect(() => {
    filterStudents();
  }, [search, allStudents]);

  const loadAllStudents = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${BASE_URL}/students`);
      if (!res.ok) throw new Error("Failed to load students");
      const data = await res.json();
      setAllStudents(data);
      setStudents(data); // Show all initially
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const filterStudents = useCallback(() => {
    const filtered = allStudents.filter(student => {
      // Name search (case-insensitive partial match)
      const matchesName = !search.name || 
        student.name.toLowerCase().includes(search.name.toLowerCase());
      
      // Phone search (substring match)
      const matchesPhone = !search.phoneNo || 
        student.phoneNo.includes(search.phoneNo);
      
      // Course search (any course name partial match)
      const matchesCourse = !search.courseName || 
        (student.courses && student.courses.some(course =>
          course.courseName.toLowerCase().includes(search.courseName.toLowerCase())
        ));
      
      return matchesName && matchesPhone && matchesCourse;
    });
    setStudents(filtered);
  }, [allStudents, search]);

  function handleInputChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  function handleCourseChange(index, field, value) {
    setForm(prev => {
      const updatedCourses = prev.courses.map((c, i) =>
        i === index ? { ...c, [field]: value } : c
      );
      return { ...prev, courses: updatedCourses };
    });
  }

  function addCourseRow() {
    setForm(prev => ({
      ...prev,
      courses: [...prev.courses, { courseId: "", courseName: "" }]
    }));
  }

  function removeCourseRow(index) {
    setForm(prev => ({
      ...prev,
      courses: prev.courses.filter((_, i) => i !== index)
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const payload = {
      name: form.name.trim(),
      phoneNo: form.phoneNo.trim(),
      courses: form.courses.filter(course => 
        course.courseId.trim() && course.courseName.trim()
      )
    };

    if (!payload.name || !payload.phoneNo || payload.courses.length === 0) {
      setError("Please fill all required fields");
      return;
    }

    try {
      const url = isEditing ? `${BASE_URL}/students/${form.id}` : `${BASE_URL}/students`;
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error(isEditing ? "Update failed" : "Create failed");

      await loadAllStudents(); // Reload all data
      resetForm();
    } catch (err) {
      setError(err.message);
    }
  }

  function resetForm() {
    setForm(emptyStudent);
    setIsEditing(false);
  }

  function onEdit(student) {
    setForm({
      id: student.id,
      name: student.name || "",
      phoneNo: student.phoneNo || "",
      courses: student.courses?.length > 0 ? student.courses : [{ courseId: "", courseName: "" }]
    });
    setIsEditing(true);
  }

  async function onDelete(id) {
    if (!window.confirm("Delete this student?")) return;
    try {
      const res = await fetch(`${BASE_URL}/students/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      await loadAllStudents(); // Reload all data
    } catch (err) {
      setError(err.message);
    }
  }

  function handleSearchChange(e) {
    const { name, value } = e.target;
    setSearch(prev => ({ ...prev, [name]: value }));
  }

  function clearSearch() {
    setSearch({ name: "", phoneNo: "", courseName: "" });
  }

  return (
    <div className="container">
      <h1>🎓 Student Management System</h1>

      {error && <div className="error">❌ {error}</div>}

      {/* Search section - LIVE filtering */}
      <section className="card">
        <h2>🔍 Live Search ({students.length}/{allStudents.length})</h2>
        <div className="search-form">
          <div className="form-row">
            <label>👤 Name</label>
            <input
              type="text"
              name="name"
              placeholder="Search by name..."
              value={search.name}
              onChange={handleSearchChange}
            />
          </div>
          <div className="form-row">
            <label>📱 Phone</label>
            <input
              type="text"
              name="phoneNo"
              placeholder="Search by phone..."
              value={search.phoneNo}
              onChange={handleSearchChange}
            />
          </div>
          <div className="form-row">
            <label>📚 Course</label>
            <input
              type="text"
              name="courseName"
              placeholder="Search by course name..."
              value={search.courseName}
              onChange={handleSearchChange}
            />
          </div>
          <button className="clear-btn" type="button" onClick={clearSearch}>
            🗑️ Clear All
          </button>
        </div>
      </section>

      {/* Create/Update form */}
      <section className="card">
        <h2>{isEditing ? "✏️ Edit Student" : "➕ Add Student"}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <label>👤 Name *</label>
            <input
              name="name"
              type="text"
              placeholder="Enter full name"
              value={form.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-row">
            <label>📱 Phone *</label>
            <input
              name="phoneNo"
              type="tel"
              placeholder="Enter phone number"
              value={form.phoneNo}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="courses-section">
            <div className="courses-header">
              <h3>📚 Courses</h3>
              <button type="button" className="small-button" onClick={addCourseRow}>
                ➕ Add Course
              </button>
            </div>
            {form.courses.map((course, index) => (
              <div className="course-row" key={index}>
                <div className="form-row">
                  <label>Course ID</label>
                  <input
                    type="text"
                    placeholder="ID"
                    value={course.courseId}
                    onChange={e => handleCourseChange(index, "courseId", e.target.value)}
                  />
                </div>
                <div className="form-row">
                  <label>Course Name</label>
                  <input
                    type="text"
                    placeholder="Name"
                    value={course.courseName}
                    onChange={e => handleCourseChange(index, "courseName", e.target.value)}
                  />
                </div>
                {form.courses.length > 1 && (
                  <button
                    type="button"
                    className="small-button danger"
                    onClick={() => removeCourseRow(index)}
                  >
                    ❌ Remove
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="button-row">
            <button type="submit">{isEditing ? "💾 Update" : "✅ Create"}</button>
            <button type="button" onClick={resetForm}>🔄 Reset</button>
          </div>
        </form>
      </section>

      {/* Students table */}
      <section className="card">
        <h2>📋 Students ({students.length})</h2>
        {loading ? (
          <p className="loading">⏳ Loading...</p>
        ) : students.length === 0 ? (
          <p className="no-data">
            {allStudents.length === 0 ? "📭 No students yet. Create one!" : "🔍 No matches found"}
          </p>
        ) : (
          <div className="table-container">
            <table className="students-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Courses</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map(student => (
                  <tr key={student.id}>
                    <td>{student.id?.substring(0, 8)}...</td>
                    <td>{student.name}</td>
                    <td>{student.phoneNo}</td>
                    <td>
                      {student.courses?.map(course => (
                        <div key={course.courseId} className="course-tag">
                          {course.courseId} - {course.courseName}
                        </div>
                      )) || <span className="no-courses">None</span>}
                    </td>
                    <td>
                      <button className="small-button" onClick={() => onEdit(student)}>
                        ✏️ Edit
                      </button>
                      <button className="small-button danger" onClick={() => onDelete(student.id)}>
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default App;

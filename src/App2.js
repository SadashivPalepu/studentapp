import React, { useEffect, useState } from "react";
import "./App.css";

const BASE_URL = "https://studentapi-d9xy.onrender.com";

const emptyStudent = {
  id: null,
  name: "",
  phoneNo: "",
  courses: [
    { courseId: "", courseName: "" }
  ]
};

function App() {
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

  // load all students initially
  useEffect(() => {
    fetchStudents();
  }, []);

  async function fetchStudents(query = {}) {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (query.name) params.append("name", query.name);
      if (query.phoneNo) params.append("phoneNo", query.phoneNo);
      if (query.courseName) params.append("courseName", query.courseName);

      const url =
        params.toString().length > 0
          ? `${BASE_URL}/students?${params.toString()}`
          : `${BASE_URL}/students`;

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error("Failed to load students");
      }
      const data = await res.json();
      setStudents(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

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
      name: form.name,
      phoneNo: form.phoneNo,
      courses: form.courses
    };

    try {
      const url = isEditing
        ? `${BASE_URL}/students/${form.id}`
        : `${BASE_URL}/students`;
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error(isEditing ? "Update failed" : "Create failed");
      }

      // reload list and reset
      await fetchStudents();
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
      name: student.name,
      phoneNo: student.phoneNo,
      courses: student.courses && student.courses.length > 0
        ? student.courses
        : [{ courseId: "", courseName: "" }]
    });
    setIsEditing(true);
  }

  async function onDelete(id) {
    if (!window.confirm("Delete this student?")) return;
    setError("");
    try{
      const res = await fetch(`${BASE_URL}/students/${id}`, {
        method: "DELETE"
      });
      if (!res.ok) {
        throw new Error("Delete failed");
      }
      await fetchStudents();
    } catch (err) {
      setError(err.message);
    }
  }

  function handleSearchChange(e) {
    const { name, value } = e.target;
    setSearch(prev => ({ ...prev, [name]: value }));
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    fetchStudents(search);
  }

  function clearSearch() {
    setSearch({ name: "", phoneNo: "", courseName: "" });
    fetchStudents();
  }

  return (
    <div className="container">
      <h1>Student Management</h1>

      {error && <div className="error">{error}</div>}

      {/* Search section */}
      <section className="card">
        <h2>Search Students</h2>
        <form className="search-form" onSubmit={handleSearchSubmit}>
          <div className="form-row">
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={search.name}
              onChange={handleSearchChange}
            />
          </div>
          <div className="form-row">
            <label>Phone No</label>
            <input
              type="text"
              name="phoneNo"
              value={search.phoneNo}
              onChange={handleSearchChange}
            />
          </div>
          <div className="form-row">
            <label>Course Name</label>
            <input
              type="text"
              name="courseName"
              value={search.courseName}
              onChange={handleSearchChange}
            />
          </div>
          <div className="button-row">
            <button type="submit">Search</button>
            <button type="button" onClick={clearSearch}>
              Clear
            </button>
          </div>
        </form>
      </section>

      {/* Create / Update form */}
      <section className="card">
        <h2>{isEditing ? "Update Student" : "Create Student"}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <label>Name</label>
            <input
              name="name"
              type="text"
              value={form.name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-row">
            <label>Phone No</label>
            <input
              name="phoneNo"
              type="text"
              value={form.phoneNo}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="courses-section">
            <div className="courses-header">
              <h3>Courses</h3>
              <button
                type="button"
                className="small-button"
                onClick={addCourseRow}
              >
                + Add Course
              </button>
            </div>

            {form.courses.map((course, index) => (
              <div className="course-row" key={index}>
                <div className="form-row">
                  <label>Course ID</label>
                  <input
                    type="text"
                    value={course.courseId}
                    onChange={e =>
                      handleCourseChange(index, "courseId", e.target.value)
                    }
                    required
                  />
                </div>
                <div className="form-row">
                  <label>Course Name</label>
                  <input
                    type="text"
                    value={course.courseName}
                    onChange={e =>
                      handleCourseChange(index, "courseName", e.target.value)
                    }
                    required
                  />
                </div>
                {form.courses.length > 1 && (
                  <button
                    type="button"
                    className="small-button danger"
                    onClick={() => removeCourseRow(index)}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="button-row">
            <button type="submit">
              {isEditing ? "Update" : "Create"}
            </button>
            <button type="button" onClick={resetForm}>
              Reset
            </button>
          </div>
        </form>
      </section>

      {/* Students table */}
      <section className="card">
        <h2>Students List</h2>
        {loading ? (
          <p>Loading...</p>
        ) : students.length === 0 ? (
          <p>No students found.</p>
        ) : (
          <table className="students-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Phone No</th>
                <th>Courses</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map(stu => (
                <tr key={stu.id}>
                  <td>{stu.id}</td>
                  <td>{stu.name}</td>
                  <td>{stu.phoneNo}</td>
                  <td>
                    {stu.courses &&
                      stu.courses.map(c => (
                        <div key={c.courseId}>
                          {c.courseId} - {c.courseName}
                        </div>
                      ))}
                  </td>
                  <td>
                    <button
                      type="button"
                      className="small-button"
                      onClick={() => onEdit(stu)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="small-button danger"
                      onClick={() => onDelete(stu.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

export default App;

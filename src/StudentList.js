import React, { useState } from 'react';

const API_BASE = 'https://studentapi-d9xy.onrender.com';

function StudentList({ students, loading, onStudentUpdated, onStudentDeleted }) {
    const [deleteModal, setDeleteModal] = useState({ show: false, studentId: null });

    const updateStudent = async (id, updatedData) => {
        try {
            const response = await fetch(`${API_BASE}/students/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            });
            if (response.ok) onStudentUpdated();
        } catch (error) {
            console.error('Update error:', error);
        }
    };

    const openDeleteModal = (id) => {
        setDeleteModal({ show: true, studentId: id });
    };

    const closeDeleteModal = () => {
        setDeleteModal({ show: false, studentId: null });
    };

    const confirmDelete = async () => {
        const id = deleteModal.studentId;
        try {
            await fetch(`${API_BASE}/students/${id}`, { method: 'DELETE' });
            onStudentDeleted();
        } catch (error) {
            console.error('Delete error:', error);
        }
        closeDeleteModal();
    };

    if (loading) {
        return <div className="list-section"><div className="loading">⏳ Loading students...</div></div>;
    }

    return (
        <>
            <div className="list-section">
                <h2 style={{marginBottom: '25px', color: '#2c3e50'}}>
                    📚 Students ({students.length})
                </h2>
                
                {students.length === 0 ? (
                    <div className="no-data">
                        <h3>👥 No students found</h3>
                        <p>Try adding a new student or adjust your search</p>
                    </div>
                ) : (
                    students.map((student) => (
                        <div key={student.id} className="student-card">
                            <div className="student-header">
                                <div className="student-name">{student.name}</div>
                                <div className="student-id">ID: {student.id}</div>
                            </div>
                            <div className="student-phone">📞 {student.phoneNo}</div>
                            
                            <div className="courses-list">
                                {student.courses.map((course, index) => (
                                    <span key={index} className="course-tag">
                                        📖 {course.courseName} ({course.courseId})
                                    </span>
                                ))}
                            </div>
                            
                            <div className="btn-group">
                                <button 
                                    className="btn btn-small"
                                    onClick={() => {
                                        const newName = prompt('New name:', student.name);
                                        if (newName && newName !== student.name) {
                                            updateStudent(student.id, { name: newName });
                                        }
                                    }}
                                >
                                    ✏️ Edit Name
                                </button>
                                <button 
                                    className="btn btn-danger btn-small"
                                    onClick={() => openDeleteModal(student.id)}
                                >
                                    🗑️ Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Custom Delete Confirmation Modal */}
            {deleteModal.show && (
                <div className="modal-overlay" onClick={closeDeleteModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>🗑️ Delete Student</h3>
                        </div>
                        <div className="modal-body">
                            <p>Are you sure you want to delete this student? This action cannot be undone.</p>
                        </div>
                        <div className="modal-actions">
                            <button className="btn" onClick={closeDeleteModal}>
                                Cancel
                            </button>
                            <button className="btn btn-danger" onClick={confirmDelete}>
                                Delete Student
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default StudentList;

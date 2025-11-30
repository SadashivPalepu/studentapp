import React, { useState } from 'react';

const API_BASE = 'https://studentapi-d9xy.onrender.com';

function StudentForm({ onStudentAdded }) {
    const [formData, setFormData] = useState({
        name: '',
        phoneNo: '',
        courses: [{ courseId: '', courseName: '' }]
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_BASE}/students/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            
            if (response.ok) {
                setFormData({ name: '', phoneNo: '', courses: [{ courseId: '', courseName: '' }] });
                onStudentAdded();
            }
        } catch (error) {
            console.error('Error creating student:', error);
        }
    };

    const addCourse = () => {
        setFormData({
            ...formData,
            courses: [...formData.courses, { courseId: '', courseName: '' }]
        });
    };

    const updateCourse = (index, field, value) => {
        const newCourses = formData.courses.map((course, i) =>
            i === index ? { ...course, [field]: value } : course
        );
        setFormData({ ...formData, courses: newCourses });
    };

    const removeCourse = (index) => {
        const newCourses = formData.courses.filter((_, i) => i !== index);
        setFormData({ ...formData, courses: newCourses.length ? newCourses : [{ courseId: '', courseName: '' }] });
    };

    return (
        <div className="form-section">
            <h2 style={{marginBottom: '20px', color: '#2c3e50'}}>➕ Add New Student</h2>
            <form onSubmit={handleSubmit} className="form-grid">
                <div className="form-group">
                    <label>Full Name *</label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Phone Number *</label>
                    <input
                        type="tel"
                        value={formData.phoneNo}
                        onChange={(e) => setFormData({ ...formData, phoneNo: e.target.value })}
                        required
                    />
                </div>
                
                {formData.courses.map((course, index) => (
                    <div key={index} className="form-group" style={{position: 'relative'}}>
                        <label>Course ID</label>
                        <input
                            type="text"
                            value={course.courseId}
                            onChange={(e) => updateCourse(index, 'courseId', e.target.value)}
                            placeholder="CS101"
                        />
                        <label style={{marginTop: '10px'}}>Course Name</label>
                        <input
                            type="text"
                            value={course.courseName}
                            onChange={(e) => updateCourse(index, 'courseName', e.target.value)}
                            placeholder="Java Spring Boot"
                        />
                        {formData.courses.length > 1 && (
                            <button
                                type="button"
                                className="btn btn-danger btn-small"
                                style={{position: 'absolute', top: '10px', right: '10px'}}
                                onClick={() => removeCourse(index)}
                            >
                                ×
                            </button>
                        )}
                    </div>
                ))}

                <div style={{gridColumn: '1 / -1', display: 'flex', gap: '15px', alignItems: 'end'}}>
                    <button type="button" className="btn" onClick={addCourse}>
                        ➕ Add Course
                    </button>
                    <button type="submit" className="btn">
                        💾 Save Student
                    </button>
                </div>
            </form>
        </div>
    );
}

export default StudentForm;

import React, { useState, useEffect } from 'react';
import StudentForm from './StudentForm';
import StudentList from './StudentList';
import "./style.css";
const API_BASE = 'https://studentapi-d9xy.onrender.com'; // Change to your Render URL in production

function App() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchResults, setSearchResults] = useState([]);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/students/`);
            const data = await response.json();
            setStudents(data);
            setSearchResults(data);
        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    const handleSearch = async (type, value) => {
        if (!value.trim()) {
            setSearchResults(students);
            return;
        }

        try {
            let endpoint;
            if (type === 'name') endpoint = `${API_BASE}/students/search/name/${encodeURIComponent(value)}`;
            else if (type === 'phone') endpoint = `${API_BASE}/students/search/phone/${encodeURIComponent(value)}`;
            else if (type === 'course') endpoint = `${API_BASE}/students/search/course/${encodeURIComponent(value)}`;

            const response = await fetch(endpoint);
            const data = await response.json();
            setSearchResults(data);
        } catch (error) {
            console.error('Search error:', error);
        }
    };

    const refreshList = () => {
        fetchStudents();
    };

    return (
        <div className="container">
            <div className="header">
                <h1>🎓 Student Management System</h1>
                <p>Complete CRUD & Search Operations</p>
            </div>

            <div className="search-section">
                <div className="search-grid">
                    <div className="search-group">
                        <label>Search by Name</label>
                        <input 
                            type="text" 
                            placeholder="Enter name..."
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch('name', e.target.value)}
                            onChange={(e) => handleSearch('name', e.target.value)}
                        />
                    </div>
                    <div className="search-group">
                        <label>Search by Phone</label>
                        <input 
                            type="tel" 
                            placeholder="9876543211"
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch('phone', e.target.value)}
                            onChange={(e) => handleSearch('phone', e.target.value)}
                        />
                    </div>
                    <div className="search-group">
                        <label>Search by Course</label>
                        <input 
                            type="text" 
                            placeholder="Java Spring Boot..."
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch('course', e.target.value)}
                            onChange={(e) => handleSearch('course', e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <StudentForm onStudentAdded={refreshList} />
            <StudentList 
                students={searchResults} 
                loading={loading}
                onStudentUpdated={refreshList}
                onStudentDeleted={refreshList}
            />
        </div>
    );
}

export default App;

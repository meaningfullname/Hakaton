import React, { useState, useEffect } from 'react';
import { Users, ListTodo, BarChart3, LogOut, MapPin } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/apiService';
import AdminTodoManagement from '../features/admin/AdminTodoManagement';
import AdminRoomManagement from '../features/admin/AdminRoomManagement';
import SuccessMessage from '../ui/SuccessMessage';
import ErrorMessage from '../ui/ErrorMessage';
import Button from '../ui/Button';
import Input from '../ui/Input';

const AdminPanelPage = () => {
  const { token, user, logout } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [stats, setStats] = useState({});
  const [students, setStudents] = useState([]);
  const [editingStudent, setEditingStudent] = useState(null);
  const [studentForm, setStudentForm] = useState({
    username: '', email: '', password: '', firstName: '', lastName: '',
    studentId: '', gender: 'male', customGender: '', dateOfBirth: '',
    faculty: '', course: '', specialization: '', phoneNumber: '',
    address: { street: '', city: '', state: '', zipCode: '', country: 'Kazakhstan' }
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentView === 'students') {
      loadStats();
      loadStudents();
    }
  }, [currentView]);

  const loadStats = async () => {
    try {
      const data = await apiService.getStats(token);
      setStats(data);
    } catch (err) {
      setError('Failed to load stats');
    }
  };

  const loadStudents = async () => {
    try {
      const data = await apiService.getStudents(token);
      setStudents(data.students || []);
    } catch (err) {
      setError('Failed to load students');
    }
  };

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      if (editingStudent) {
        await apiService.updateStudent(token, editingStudent._id, studentForm);
        setMessage('Student updated successfully');
      } else {
        await apiService.createStudent(token, studentForm);
        setMessage('Student created successfully');
      }
      
      resetForm();
      loadStudents();
    } catch (err) {
      setError('Failed to save student');
    }
  };

  const editStudent = (student) => {
    setEditingStudent(student);
    setStudentForm({
      ...student,
      password: '', // Don't prefill password
      address: student.address || { street: '', city: '', state: '', zipCode: '', country: 'Kazakhstan' }
    });
  };

  const deleteStudent = async (id) => {
    if (!confirm('Delete this student?')) return;
    
    try {
      await apiService.deleteStudent(token, id);
      setMessage('Student deleted successfully');
      loadStudents();
    } catch (err) {
      setError('Failed to delete student');
    }
  };

  const resetForm = () => {
    setEditingStudent(null);
    setStudentForm({
      username: '', email: '', password: '', firstName: '', lastName: '',
      studentId: '', gender: 'male', customGender: '', dateOfBirth: '',
      faculty: '', course: '', specialization: '', phoneNumber: '',
      address: { street: '', city: '', state: '', zipCode: '', country: 'Kazakhstan' }
    });
  };

  const renderNavigation = () => (
    <div style={{
      background: '#667eea',
      color: 'white',
      padding: '1rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Admin Panel</h1>
        <nav style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={() => setCurrentView('dashboard')}
            style={{
              background: currentView === 'dashboard' ? 'rgba(255,255,255,0.2)' : 'none',
              border: 'none',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <BarChart3 size={16} />
            Dashboard
          </button>
          <button
            onClick={() => setCurrentView('students')}
            style={{
              background: currentView === 'students' ? 'rgba(255,255,255,0.2)' : 'none',
              border: 'none',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Users size={16} />
            Students
          </button>
          <button
            onClick={() => setCurrentView('todos')}
            style={{
              background: currentView === 'todos' ? 'rgba(255,255,255,0.2)' : 'none',
              border: 'none',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <ListTodo size={16} />
            Todos
          </button>
          <button
            onClick={() => setCurrentView('rooms')}
            style={{
              background: currentView === 'rooms' ? 'rgba(255,255,255,0.2)' : 'none',
              border: 'none',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <MapPin size={16} />
            Rooms
          </button>
        </nav>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span>Welcome, {user?.firstName || user?.username}</span>
        <button
          onClick={logout}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '5px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ color: '#333', marginBottom: '2rem' }}>System Overview</h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '2rem'
      }}>
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '10px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          textAlign: 'center',
          borderLeft: '4px solid #667eea'
        }}>
          <Users size={40} style={{ color: '#667eea', marginBottom: '1rem' }} />
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>Student Management</h3>
          <p style={{ color: '#666', marginBottom: '1.5rem' }}>
            Manage student accounts, profiles, and access permissions
          </p>
          <Button onClick={() => setCurrentView('students')} variant="primary">
            Manage Students
          </Button>
        </div>

        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '10px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          textAlign: 'center',
          borderLeft: '4px solid #17a2b8'
        }}>
          <ListTodo size={40} style={{ color: '#17a2b8', marginBottom: '1rem' }} />
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>Todo Management</h3>
          <p style={{ color: '#666', marginBottom: '1.5rem' }}>
            Assign tasks to students, track progress, and manage deadlines
          </p>
          <Button onClick={() => setCurrentView('todos')} variant="info">
            Manage Todos
          </Button>
        </div>

        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '10px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          textAlign: 'center',
          borderLeft: '4px solid #fd7e14'
        }}>
          <MapPin size={40} style={{ color: '#fd7e14', marginBottom: '1rem' }} />
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>Room Management</h3>
          <p style={{ color: '#666', marginBottom: '1.5rem' }}>
            Manage campus rooms, availability, and maintenance
          </p>
          <Button onClick={() => setCurrentView('rooms')} variant="warning">
            Manage Rooms
          </Button>
        </div>

        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '10px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          textAlign: 'center',
          borderLeft: '4px solid #28a745'
        }}>
          <BarChart3 size={40} style={{ color: '#28a745', marginBottom: '1rem' }} />
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>System Statistics</h3>
          <p style={{ color: '#666', marginBottom: '1.5rem' }}>
            View system-wide statistics and analytics
          </p>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#28a745' }}>
            {stats.total || 0}
          </div>
          <div style={{ fontSize: '0.9rem', color: '#666' }}>Total Students</div>
        </div>
      </div>
    </div>
  );

  const renderStudentManagement = () => (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ color: '#333', marginBottom: '2rem' }}>Student Management</h2>

      {/* Messages */}
      {message && <SuccessMessage message={message} onClose={() => setMessage('')} />}
      {error && <ErrorMessage message={error} onClose={() => setError('')} />}

      {/* Stats */}
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        {[
          { label: 'Total', value: stats.total, color: '#667eea' },
          { label: 'Active', value: stats.active, color: '#28a745' },
          { label: 'Inactive', value: stats.inactive, color: '#dc3545' },
          { label: 'Male', value: stats.male, color: '#17a2b8' },
          { label: 'Female', value: stats.female, color: '#fd7e14' },
          { label: 'Other', value: stats.other, color: '#6c757d' }
        ].map((stat, i) => (
          <div
            key={i}
            style={{
              background: 'white',
              padding: '1rem 2rem',
              borderRadius: '8px',
              minWidth: '120px',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              borderLeft: `4px solid ${stat.color}`
            }}
          >
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: stat.color }}>
              {stat.value || 0}
            </div>
            <div style={{ fontSize: '0.9rem', color: '#666' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Student Form */}
      <div style={{
        background: 'white',
        borderRadius: '10px',
        padding: '2rem',
        marginBottom: '2rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ color: '#333', marginBottom: '1.5rem' }}>
          {editingStudent ? 'Edit Student' : 'Add Student'}
        </h3>
        <form onSubmit={handleStudentSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
            <Input
              label="Username"
              type="text"
              value={studentForm.username}
              onChange={(e) => setStudentForm({...studentForm, username: e.target.value})}
              required
            />
            <Input
              label="Email"
              type="email"
              value={studentForm.email}
              onChange={(e) => setStudentForm({...studentForm, email: e.target.value})}
              required
            />
            <Input
              label="Password"
              type="password"
              value={studentForm.password}
              onChange={(e) => setStudentForm({...studentForm, password: e.target.value})}
              required={!editingStudent}
              placeholder={editingStudent ? "Leave blank to keep current password" : ""}
            />
            <Input
              label="First Name"
              type="text"
              value={studentForm.firstName}
              onChange={(e) => setStudentForm({...studentForm, firstName: e.target.value})}
              required
            />
            <Input
              label="Last Name"
              type="text"
              value={studentForm.lastName}
              onChange={(e) => setStudentForm({...studentForm, lastName: e.target.value})}
              required
            />
            <Input
              label="Student ID"
              type="text"
              value={studentForm.studentId}
              onChange={(e) => setStudentForm({...studentForm, studentId: e.target.value})}
              required
            />
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#555', fontWeight: '500' }}>
                Gender <span style={{ color: 'red' }}>*</span>
              </label>
              <select
                value={studentForm.gender}
                onChange={(e) => setStudentForm({...studentForm, gender: e.target.value})}
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  fontSize: '1rem'
                }}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <Input
              label="Date of Birth"
              type="date"
              value={studentForm.dateOfBirth ? studentForm.dateOfBirth.split('T')[0] : ''}
              onChange={(e) => setStudentForm({...studentForm, dateOfBirth: e.target.value})}
              required
            />
            
            <Input
              label="Faculty"
              type="text"
              value={studentForm.faculty}
              onChange={(e) => setStudentForm({...studentForm, faculty: e.target.value})}
              required
            />

            <Input
              label="Course (1-6)"
              type="number"
              min="1"
              max="6"
              value={studentForm.course}
              onChange={(e) => setStudentForm({...studentForm, course: parseInt(e.target.value)})}
              required
            />

            <Input
              label="Specialization"
              type="text"
              value={studentForm.specialization}
              onChange={(e) => setStudentForm({...studentForm, specialization: e.target.value})}
              required
            />

            <Input
              label="Phone Number"
              type="text"
              value={studentForm.phoneNumber}
              onChange={(e) => setStudentForm({...studentForm, phoneNumber: e.target.value})}
            />
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
            <Button type="submit">
              {editingStudent ? 'Update Student' : 'Add Student'}
            </Button>
            
            {editingStudent && (
              <Button
                type="button"
                variant="secondary"
                onClick={resetForm}
              >
                Cancel Edit
              </Button>
            )}
          </div>
        </form>
      </div>

      {/* Students Table */}
      <div style={{
        background: 'white',
        borderRadius: '10px',
        padding: '2rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        overflowX: 'auto'
      }}>
        <h3 style={{ color: '#333', marginBottom: '1.5rem' }}>Students List</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#667eea', color: 'white' }}>
              <th style={{ border: '1px solid #ddd', padding: '0.8rem', textAlign: 'left' }}>Actions</th>
              <th style={{ border: '1px solid #ddd', padding: '0.8rem', textAlign: 'left' }}>Username</th>
              <th style={{ border: '1px solid #ddd', padding: '0.8rem', textAlign: 'left' }}>Email</th>
              <th style={{ border: '1px solid #ddd', padding: '0.8rem', textAlign: 'left' }}>Student ID</th>
              <th style={{ border: '1px solid #ddd', padding: '0.8rem', textAlign: 'left' }}>Name</th>
              <th style={{ border: '1px solid #ddd', padding: '0.8rem', textAlign: 'left' }}>Faculty</th>
              <th style={{ border: '1px solid #ddd', padding: '0.8rem', textAlign: 'left' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, i) => (
              <tr key={student._id} style={{ background: i % 2 === 0 ? '#f2f2f2' : 'white' }}>
                <td style={{ border: '1px solid #ddd', padding: '0.8rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Button
                      onClick={() => editStudent(student)}
                      variant="warning"
                      size="small"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => deleteStudent(student._id)}
                      variant="danger"
                      size="small"
                    >
                      Delete
                    </Button>
                  </div>
                </td>
                <td style={{ border: '1px solid #ddd', padding: '0.8rem' }}>{student.username}</td>
                <td style={{ border: '1px solid #ddd', padding: '0.8rem' }}>{student.email}</td>
                <td style={{ border: '1px solid #ddd', padding: '0.8rem' }}>{student.studentId}</td>
                <td style={{ border: '1px solid #ddd', padding: '0.8rem' }}>
                  {student.firstName} {student.lastName}
                </td>
                <td style={{ border: '1px solid #ddd', padding: '0.8rem' }}>{student.faculty}</td>
                <td style={{ border: '1px solid #ddd', padding: '0.8rem' }}>
                  <span style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    background: student.isActive ? '#d4edda' : '#f8d7da',
                    color: student.isActive ? '#155724' : '#721c24'
                  }}>
                    {student.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (currentView) {
      case 'students':
        return renderStudentManagement();
      case 'todos':
        return <AdminTodoManagement />;
      case 'rooms':
        return <AdminRoomManagement />;
      default:
        return renderDashboard();
    }
  };

  return (
    <div style={{
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh'
    }}>
      {renderNavigation()}
      <main style={{ minHeight: 'calc(100vh - 80px)' }}>
        {renderContent()}
      </main>
    </div>
  );
};

export default AdminPanelPage;
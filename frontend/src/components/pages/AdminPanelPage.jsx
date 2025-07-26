import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/apiService';
import SuccessMessage from '../ui/SuccessMessage';
import ErrorMessage from '../ui/ErrorMessage';
import Button from '../ui/Button';
import Input from '../ui/Input';

const AdminPanelPage = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState({});
  const [students, setStudents] = useState([]);
  const [editingStudent, setEditingStudent] = useState(null);
  const [studentForm, setStudentForm] = useState({
    username: '', email: '', password: '', firstName: '', lastName: '',
    studentId: '', gender: 'male', customGender: '', dateOfBirth: '',
    faculty: '', course: '', specialization: '', phoneNumber: '',
    address: { street: '', city: '', state: '', zipCode: '', country: '' }
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadStats();
    loadStudents();
  }, []);

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
      address: student.address || { street: '', city: '', state: '', zipCode: '', country: '' }
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
     address: { street: '', city: '', state: '', zipCode: '', country: '' }
   });
 };

 return (
   <div style={{
     fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
     background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
     minHeight: '100vh',
     padding: '2rem 0'
   }}>
     <div style={{
       background: 'white',
       margin: '0 auto',
       padding: '2rem',
       borderRadius: '10px',
       boxShadow: '0 15px 35px rgba(0, 0, 0, 0.1)',
       maxWidth: '1200px'
     }}>
       <h1 style={{ color: '#333', marginBottom: '2rem' }}>Admin Panel</h1>

       {message && <SuccessMessage message={message} onClose={() => setMessage('')} />}
       {error && <ErrorMessage message={error} onClose={() => setError('')} />}

       {/* Stats */}
       <h2 style={{ color: '#333', marginBottom: '1rem' }}>System Statistics</h2>
       <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
         {[
           { label: 'Total', value: stats.total },
           { label: 'Active', value: stats.active },
           { label: 'Inactive', value: stats.inactive },
           { label: 'Male', value: stats.male },
           { label: 'Female', value: stats.female },
           { label: 'Other', value: stats.other }
         ].map((stat, i) => (
           <div
             key={i}
             style={{
               background: '#f8f9fa',
               padding: '1rem 2rem',
               borderRadius: '8px',
               minWidth: '120px',
               textAlign: 'center',
               boxShadow: '0 2px 8px rgba(102, 126, 234, 0.08)'
             }}
           >
             <strong>{stat.label}:</strong><br/>{stat.value || 0}
           </div>
         ))}
       </div>

       {/* Student Form */}
       <h2 style={{ color: '#333', marginBottom: '1rem' }}>
         {editingStudent ? 'Edit Student' : 'Add Student'}
       </h2>
       <form onSubmit={handleStudentSubmit} style={{ marginBottom: '2rem' }}>
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
         </div>

         <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
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

       {/* Students Table */}
       <h2 style={{ color: '#333', marginBottom: '1rem' }}>Students</h2>
       <div style={{ overflowX: 'auto' }}>
         <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
           <thead>
             <tr style={{ background: '#667eea', color: 'white' }}>
               <th style={{ border: '1px solid #ddd', padding: '0.5rem 1rem', textAlign: 'left' }}>Actions</th>
               <th style={{ border: '1px solid #ddd', padding: '0.5rem 1rem', textAlign: 'left' }}>Username</th>
               <th style={{ border: '1px solid #ddd', padding: '0.5rem 1rem', textAlign: 'left' }}>Email</th>
               <th style={{ border: '1px solid #ddd', padding: '0.5rem 1rem', textAlign: 'left' }}>Student ID</th>
               <th style={{ border: '1px solid #ddd', padding: '0.5rem 1rem', textAlign: 'left' }}>Name</th>
               <th style={{ border: '1px solid #ddd', padding: '0.5rem 1rem', textAlign: 'left' }}>Status</th>
             </tr>
           </thead>
           <tbody>
             {students.map((student, i) => (
               <tr key={student._id} style={{ background: i % 2 === 0 ? '#f2f2f2' : 'white' }}>
                 <td style={{ border: '1px solid #ddd', padding: '0.5rem 1rem' }}>
                   <Button
                     onClick={() => editStudent(student)}
                     variant="warning"
                     size="small"
                     style={{ marginRight: '0.5rem' }}
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
                 </td>
                 <td style={{ border: '1px solid #ddd', padding: '0.5rem 1rem' }}>{student.username}</td>
                 <td style={{ border: '1px solid #ddd', padding: '0.5rem 1rem' }}>{student.email}</td>
                 <td style={{ border: '1px solid #ddd', padding: '0.5rem 1rem' }}>{student.studentId}</td>
                 <td style={{ border: '1px solid #ddd', padding: '0.5rem 1rem' }}>
                   {student.firstName} {student.lastName}
                 </td>
                 <td style={{ border: '1px solid #ddd', padding: '0.5rem 1rem' }}>
                   {student.isActive ? 'Active' : 'Inactive'}
                 </td>
               </tr>
             ))}
           </tbody>
         </table>
       </div>
     </div>
   </div>
 );
};

export default AdminPanelPage;
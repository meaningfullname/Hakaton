// frontend/src/components/features/admin/AdminTodoManagement.jsx

import React, { useState, useEffect } from 'react';
import { Plus, Users, BarChart3 } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import todoService from '../../../services/todoService';
import apiService from '../../../services/apiService';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import SuccessMessage from '../../ui/SuccessMessage';
import ErrorMessage from '../../ui/ErrorMessage';
import LoadingSpinner from '../../ui/LoadingSpinner';

const AdminTodoManagement = () => {
  const { token } = useAuth();
  const [todos, setTodos] = useState([]);
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [assignForm, setAssignForm] = useState({
    studentId: '',
    title: '',
    description: '',
    deadline: '',
    priority: 'medium',
    isRequired: false,
    adminNotes: ''
  });
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    assignedTo: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    loadData();
  }, [filters, pagination.page]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [todosData, studentsData, statsData] = await Promise.all([
        todoService.admin.getAllTodos(token, filters, pagination.page, pagination.limit),
        apiService.getStudents(token, 1000),
        todoService.admin.getAdminStats(token)
      ]);

      setTodos(todosData.todos);
      setPagination(prev => ({
        ...prev,
        total: todosData.total,
        pages: todosData.pages
      }));
      setStudents(studentsData.students || []);
      setStats(statsData);
    } catch (err) {
      setError('Failed to load data');
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTodo = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      await todoService.admin.assignTodo(token, assignForm);
      setMessage('Todo assigned successfully!');
      setShowAssignForm(false);
      setAssignForm({
        studentId: '',
        title: '',
        description: '',
        deadline: '',
        priority: 'medium',
        isRequired: false,
        adminNotes: ''
      });
      loadData();
    } catch (err) {
      setError('Failed to assign todo');
      console.error('Error assigning todo:', err);
    }
  };

  const handleDeleteTodo = async (todoId) => {
    if (!window.confirm('Are you sure you want to delete this todo?')) {
      return;
    }

    try {
      await todoService.admin.deleteTodo(token, todoId);
      setMessage('Todo deleted successfully!');
      loadData();
    } catch (err) {
      setError('Failed to delete todo');
      console.error('Error deleting todo:', err);
    }
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ status: '', type: '', assignedTo: '' });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const renderStatsCards = () => (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem',
      marginBottom: '2rem'
    }}>
      {[
        { label: 'Total Todos', value: stats.total, color: '#667eea', icon: <BarChart3 size={24} /> },
        { label: 'Assigned', value: stats.assigned, color: '#17a2b8', icon: <Users size={24} /> },
        { label: 'Personal', value: stats.personal, color: '#28a745', icon: <Users size={24} /> },
        { label: 'Completed', value: stats.completed, color: '#28a745', icon: <BarChart3 size={24} /> },
        { label: 'Overdue', value: stats.overdue, color: '#dc3545', icon: <BarChart3 size={24} /> },
        { label: 'Urgent', value: stats.urgent, color: '#fd7e14', icon: <BarChart3 size={24} /> },
        { label: 'Unviewed Assigned', value: stats.unviewedAssigned, color: '#ffc107', icon: <Users size={24} /> }
      ].map((stat, index) => (
        <div
          key={index}
          style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '10px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            textAlign: 'center',
            borderLeft: `4px solid ${stat.color}`
          }}
        >
          <div style={{ color: stat.color, marginBottom: '0.5rem' }}>
            {stat.icon}
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: stat.color, marginBottom: '0.25rem' }}>
            {stat.value || 0}
          </div>
          <div style={{ fontSize: '0.9rem', color: '#666' }}>
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );

  const renderFilters = () => (
    <div style={{
      background: 'white',
      borderRadius: '10px',
      padding: '1.5rem',
      marginBottom: '1.5rem',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <h3 style={{ marginBottom: '1rem', color: '#333' }}>Filters</h3>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        alignItems: 'end'
      }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', fontWeight: '500' }}>
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            style={{
              width: '100%',
              padding: '0.6rem',
              border: '1px solid #ddd',
              borderRadius: '5px',
              fontSize: '14px'
            }}
          >
            <option value="">All Statuses</option>
            <option value="todo">Todo</option>
            <option value="doing">Doing</option>
            <option value="done">Done</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', fontWeight: '500' }}>
            Type
          </label>
          <select
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            style={{
              width: '100%',
              padding: '0.6rem',
              border: '1px solid #ddd',
              borderRadius: '5px',
              fontSize: '14px'
            }}
          >
            <option value="">All Types</option>
            <option value="personal">Personal</option>
            <option value="assigned">Assigned</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', fontWeight: '500' }}>
            Student
          </label>
          <select
            value={filters.assignedTo}
            onChange={(e) => handleFilterChange('assignedTo', e.target.value)}
            style={{
              width: '100%',
              padding: '0.6rem',
              border: '1px solid #ddd',
              borderRadius: '5px',
              fontSize: '14px'
            }}
          >
            <option value="">All Students</option>
            {students.map(student => (
              <option key={student._id} value={student._id}>
                {student.firstName} {student.lastName} ({student.studentId})
              </option>
            ))}
          </select>
        </div>

        <div>
          <Button onClick={clearFilters} variant="secondary" size="small">
            Clear Filters
          </Button>
        </div>
      </div>
    </div>
  );

  const renderAssignForm = () => {
    if (!showAssignForm) return null;

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '10px',
          padding: '2rem',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Assign Todo to Student</h3>
          <form onSubmit={handleAssignTodo}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Student *
              </label>
              <select
                value={assignForm.studentId}
                onChange={(e) => setAssignForm({...assignForm, studentId: e.target.value})}
                required
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  marginBottom: '1rem'
                }}
              >
                <option value="">Select a student...</option>
                {students.map(student => (
                  <option key={student._id} value={student._id}>
                    {student.firstName} {student.lastName} ({student.studentId})
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Title"
              type="text"
              value={assignForm.title}
              onChange={(e) => setAssignForm({...assignForm, title: e.target.value})}
              required
            />

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Description
              </label>
              <textarea
                value={assignForm.description}
                onChange={(e) => setAssignForm({...assignForm, description: e.target.value})}
                rows="4"
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  resize: 'vertical'
                }}
              />
            </div>

            <Input
              label="Deadline"
              type="datetime-local"
              value={assignForm.deadline}
              onChange={(e) => setAssignForm({...assignForm, deadline: e.target.value})}
            />

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Priority
              </label>
              <select
                value={assignForm.priority}
                onChange={(e) => setAssignForm({...assignForm, priority: e.target.value})}
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  border: '1px solid #ddd',
                  borderRadius: '5px'
                }}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  checked={assignForm.isRequired}
                  onChange={(e) => setAssignForm({...assignForm, isRequired: e.target.checked})}
                />
                <span style={{ fontWeight: '500' }}>Required Task</span>
              </label>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Admin Notes
              </label>
              <textarea
                value={assignForm.adminNotes}
                onChange={(e) => setAssignForm({...assignForm, adminNotes: e.target.value})}
                rows="3"
                placeholder="Optional notes for the student..."
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowAssignForm(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Assign Todo
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderTodosTable = () => (
    <div style={{
      background: 'white',
      borderRadius: '10px',
      padding: '1.5rem',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      overflowX: 'auto'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem'
      }}>
        <h3 style={{ margin: 0, color: '#333' }}>
          All Todos ({pagination.total})
        </h3>
        <Button
          onClick={() => setShowAssignForm(true)}
          icon={<Plus size={16} />}
          variant="primary"
        >
          Assign Todo
        </Button>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f8f9fa' }}>
            <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Title</th>
            <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Student</th>
            <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Status</th>
            <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Type</th>
            <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Priority</th>
            <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Deadline</th>
            <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {todos.map((todo, index) => (
            <tr key={todo._id} style={{
              background: index % 2 === 0 ? 'white' : '#f8f9fa'
            }}>
              <td style={{ padding: '1rem', borderBottom: '1px solid #dee2e6' }}>
                <div>
                  <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
                    {todo.title}
                  </div>
                  {todo.description && (
                    <div style={{ fontSize: '0.85rem', color: '#666', maxWidth: '200px' }}>
                      {todo.description.length > 50 
                        ? `${todo.description.substring(0, 50)}...` 
                        : todo.description}
                    </div>
                  )}
                  {todo.isRequired && (
                    <div style={{
                      background: '#dc3545',
                      color: 'white',
                      padding: '2px 6px',
                      borderRadius: '10px',
                      fontSize: '0.7rem',
                      display: 'inline-block',
                      marginTop: '0.25rem'
                    }}>
                      REQUIRED
                    </div>
                  )}
                </div>
              </td>
              <td style={{ padding: '1rem', borderBottom: '1px solid #dee2e6' }}>
                {todo.assignedTo && (
                  <div>
                    <div style={{ fontWeight: 'bold' }}>
                      {todo.assignedTo.firstName} {todo.assignedTo.lastName}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#666' }}>
                      {todo.assignedTo.studentId || todo.assignedTo.username}
                    </div>
                  </div>
                )}
              </td>
              <td style={{ padding: '1rem', borderBottom: '1px solid #dee2e6' }}>
                <span style={{
                  padding: '0.25rem 0.5rem',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  background: todo.status === 'done' ? '#d4edda' : 
                             todo.status === 'doing' ? '#d1ecf1' : '#fff3cd',
                  color: todo.status === 'done' ? '#155724' : 
                         todo.status === 'doing' ? '#0c5460' : '#856404'
                }}>
                  {todo.status}
                </span>
              </td>
              <td style={{ padding: '1rem', borderBottom: '1px solid #dee2e6' }}>
                <span style={{
                  padding: '0.25rem 0.5rem',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  background: todo.type === 'assigned' ? '#d1ecf1' : '#d4edda',
                  color: todo.type === 'assigned' ? '#0c5460' : '#155724'
                }}>
                  {todo.type}
                </span>
              </td>
              <td style={{ padding: '1rem', borderBottom: '1px solid #dee2e6' }}>
                <span style={{
                  padding: '0.25rem 0.5rem',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  background: todo.priority === 'urgent' ? '#f8d7da' :
                             todo.priority === 'high' ? '#fdebd0' :
                             todo.priority === 'medium' ? '#fff3cd' : '#d4edda',
                  color: todo.priority === 'urgent' ? '#721c24' :
                         todo.priority === 'high' ? '#856404' :
                         todo.priority === 'medium' ? '#856404' : '#155724'
                }}>
                  {todo.priority}
                </span>
              </td>
              <td style={{ padding: '1rem', borderBottom: '1px solid #dee2e6' }}>
                {todo.deadline ? (
                  <div style={{
                    fontSize: '0.85rem',
                    color: new Date(todo.deadline) < new Date() && todo.status !== 'done' ? '#dc3545' : '#666'
                  }}>
                    {new Date(todo.deadline).toLocaleDateString()}
                  </div>
                ) : (
                  <span style={{ color: '#999' }}>No deadline</span>
                )}
              </td>
              <td style={{ padding: '1rem', borderBottom: '1px solid #dee2e6' }}>
                <Button
                  onClick={() => handleDeleteTodo(todo._id)}
                  variant="danger"
                  size="small"
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '1rem',
          marginTop: '1.5rem'
        }}>
          <Button
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            disabled={pagination.page === 1}
            variant="secondary"
            size="small"
          >
            Previous
          </Button>
          
          <span style={{ fontSize: '0.9rem', color: '#666' }}>
            Page {pagination.page} of {pagination.pages}
          </span>
          
          <Button
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            disabled={pagination.page === pagination.pages}
            variant="secondary"
            size="small"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <h2 style={{ color: '#333', marginBottom: '2rem', fontSize: '2rem' }}>
        Todo Management
      </h2>

      {/* Messages */}
      {message && <SuccessMessage message={message} onClose={() => setMessage('')} />}
      {error && <ErrorMessage message={error} onClose={() => setError('')} />}

      {/* Stats Cards */}
      {renderStatsCards()}

      {/* Filters */}
      {renderFilters()}

      {/* Todos Table */}
      {renderTodosTable()}

      {/* Assign Form Modal */}
      {renderAssignForm()}
    </div>
  );
};

export default AdminTodoManagement;
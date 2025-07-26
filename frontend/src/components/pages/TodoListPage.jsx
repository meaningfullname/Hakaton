import React, { useState, useEffect } from 'react';
import { Plus, AlertTriangle } from 'lucide-react';
import { useTodo } from '../../contexts/TodoContext';
import { useAuth } from '../../contexts/AuthContext';
import TodoCard from '../features/todo/TodoCard';
import TodoForm from '../features/todo/TodoForm';
import TodoFilters from '../features/todo/TodoFilters';
import Button from '../ui/Button';
import ErrorMessage from '../ui/ErrorMessage';
import SuccessMessage from '../ui/SuccessMessage';
import LoadingSpinner from '../ui/LoadingSpinner';

const TodoListPage = () => {
  const { user } = useAuth();
  const {
    todos,
    stats,
    loading,
    error,
    filters,
    createTodo,
    updateTodoStatus,
    updateTodo,
    deleteTodo,
    applyFilters,
    clearFilters,
    getTodosByStatus,
    getOverdueTodos,
    setError
  } = useTodo();

  const [showForm, setShowForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [message, setMessage] = useState('');
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' or 'list'

  // Clear messages after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, setError]);

  const handleCreateTodo = async (todoData) => {
    try {
      await createTodo(todoData);
      setShowForm(false);
      setMessage('Todo created successfully!');
    } catch (err) {
      console.error('Error creating todo:', err);
    }
  };

  const handleEditTodo = async (todoData) => {
    try {
      await updateTodo(editingTodo._id, todoData);
      setEditingTodo(null);
      setShowForm(false);
      setMessage('Todo updated successfully!');
    } catch (err) {
      console.error('Error updating todo:', err);
    }
  };

  const handleStatusUpdate = async (todoId, newStatus) => {
    try {
      await updateTodoStatus(todoId, newStatus);
      setMessage(`Todo status updated to ${newStatus}!`);
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleDeleteTodo = async (todoId) => {
    if (!window.confirm('Are you sure you want to delete this todo?')) {
      return;
    }

    try {
      await deleteTodo(todoId);
      setMessage('Todo deleted successfully!');
    } catch (err) {
      console.error('Error deleting todo:', err);
    }
  };

  const handleEditClick = (todo) => {
    setEditingTodo(todo);
    setShowForm(true);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingTodo(null);
  };

  const renderKanbanView = () => {
    const todoTasks = getTodosByStatus('todo');
    const doingTasks = getTodosByStatus('doing');
    const doneTasks = getTodosByStatus('done');
    const overdueTasks = getOverdueTodos();

    const columnStyle = {
      background: '#f8f9fa',
      borderRadius: '10px',
      padding: '1rem',
      minHeight: '500px',
      flex: 1,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    };

    const headerStyle = {
      textAlign: 'center',
      marginBottom: '1rem',
      padding: '0.5rem',
      borderRadius: '5px',
      color: 'white',
      fontSize: '1.1em',
      fontWeight: 'bold'
    };

    return (
      <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', minHeight: '500px' }}>
        {/* Todo Column */}
        <div style={columnStyle}>
          <h2 style={{ ...headerStyle, background: '#6c757d' }}>
            To Do ({todoTasks.length})
          </h2>
          {todoTasks.map(todo => (
            <TodoCard
              key={todo._id}
              todo={todo}
              onStatusUpdate={handleStatusUpdate}
              onDelete={handleDeleteTodo}
              onEdit={handleEditClick}
            />
          ))}
        </div>

        {/* Doing Column */}
        <div style={columnStyle}>
          <h2 style={{ ...headerStyle, background: '#17a2b8' }}>
            Doing ({doingTasks.length})
          </h2>
          {doingTasks.map(todo => (
            <TodoCard
              key={todo._id}
              todo={todo}
              onStatusUpdate={handleStatusUpdate}
              onDelete={handleDeleteTodo}
              onEdit={handleEditClick}
            />
          ))}
        </div>

        {/* Done Column */}
        <div style={columnStyle}>
          <h2 style={{ ...headerStyle, background: '#28a745' }}>
            Done ({doneTasks.length})
          </h2>
          {doneTasks.map(todo => (
            <TodoCard
              key={todo._id}
              todo={todo}
              onStatusUpdate={handleStatusUpdate}
              onDelete={handleDeleteTodo}
              onEdit={handleEditClick}
            />
          ))}
        </div>

        {/* Overdue Column */}
        {overdueTasks.length > 0 && (
          <div style={columnStyle}>
            <h2 style={{ ...headerStyle, background: '#dc3545' }}>
              <AlertTriangle size={18} style={{ marginRight: '0.5rem' }} />
              Overdue ({overdueTasks.length})
            </h2>
            {overdueTasks.map(todo => (
              <TodoCard
                key={todo._id}
                todo={todo}
                onStatusUpdate={handleStatusUpdate}
                onDelete={handleDeleteTodo}
                onEdit={handleEditClick}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderListView = () => {
    return (
      <div style={{
        background: 'white',
        borderRadius: '10px',
        padding: '1rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        {todos.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            color: '#666'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
            <h3>No todos found</h3>
            <p>Create your first todo to get started!</p>
          </div>
        ) : (
          todos.map(todo => (
            <TodoCard
              key={todo._id}
              todo={todo}
              onStatusUpdate={handleStatusUpdate}
              onDelete={handleDeleteTodo}
              onEdit={handleEditClick}
            />
          ))
        )}
      </div>
    );
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <h1 style={{ color: 'white', fontSize: '2.5rem', margin: 0 }}>
          My Todos
        </h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {/* View Mode Toggle */}
          <div style={{ display: 'flex', background: 'white', borderRadius: '5px', overflow: 'hidden' }}>
            <button
              onClick={() => setViewMode('kanban')}
              style={{
                padding: '0.5rem 1rem',
                border: 'none',
                background: viewMode === 'kanban' ? '#667eea' : 'white',
                color: viewMode === 'kanban' ? 'white' : '#333',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Kanban
            </button>
            <button
              onClick={() => setViewMode('list')}
              style={{
                padding: '0.5rem 1rem',
                border: 'none',
                background: viewMode === 'list' ? '#667eea' : 'white',
                color: viewMode === 'list' ? 'white' : '#333',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              List
            </button>
          </div>

          <Button
            onClick={() => setShowForm(true)}
            icon={<Plus size={20} />}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            Add Todo
          </Button>
        </div>
      </div>

      {/* Messages */}
      {message && <SuccessMessage message={message} onClose={() => setMessage('')} />}
      {error && <ErrorMessage message={error} onClose={() => setError('')} />}

      {/* Filters */}
      <TodoFilters
        filters={filters}
        onFilterChange={applyFilters}
        onClearFilters={clearFilters}
        stats={stats}
      />

      {/* Content */}
      {viewMode === 'kanban' ? renderKanbanView() : renderListView()}

      {/* Todo Form Modal */}
      <TodoForm
        todo={editingTodo}
        onSubmit={editingTodo ? handleEditTodo : handleCreateTodo}
        onCancel={handleFormCancel}
        isOpen={showForm}
      />
    </div>
  );
};

export default TodoListPage;
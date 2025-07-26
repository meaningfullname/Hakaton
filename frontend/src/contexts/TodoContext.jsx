import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import todoService from '../services/todoService';

const TodoContext = createContext();

export const useTodo = () => {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error('useTodo must be used within TodoProvider');
  }
  return context;
};

export const TodoProvider = ({ children }) => {
  const { token, user } = useAuth();
  const [todos, setTodos] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    priority: ''
  });

  // Load todos
  const loadTodos = async (customFilters = filters) => {
    if (!token) return;
    
    setLoading(true);
    setError('');
    
    try {
      const data = await todoService.getTodos(token, customFilters);
      setTodos(data);
    } catch (err) {
      setError('Failed to load todos');
      console.error('Error loading todos:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load stats
  const loadStats = async () => {
    if (!token) return;
    
    try {
      const data = await todoService.getTodoStats(token);
      setStats(data);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  // Create todo
  const createTodo = async (todoData) => {
    if (!token) return;
    
    try {
      const result = await todoService.createTodo(token, todoData);
      await loadTodos();
      await loadStats();
      return result;
    } catch (err) {
      setError('Failed to create todo');
      throw err;
    }
  };

  // Update todo status
  const updateTodoStatus = async (todoId, status) => {
    if (!token) return;
    
    try {
      const result = await todoService.updateTodoStatus(token, todoId, status);
      await loadTodos();
      await loadStats();
      return result;
    } catch (err) {
      setError('Failed to update todo status');
      throw err;
    }
  };

  // Update todo
  const updateTodo = async (todoId, todoData) => {
    if (!token) return;
    
    try {
      const result = await todoService.updateTodo(token, todoId, todoData);
      await loadTodos();
      await loadStats();
      return result;
    } catch (err) {
      setError('Failed to update todo');
      throw err;
    }
  };

  // Delete todo
  const deleteTodo = async (todoId) => {
    if (!token) return;
    
    try {
      const result = await todoService.deleteTodo(token, todoId);
      await loadTodos();
      await loadStats();
      return result;
    } catch (err) {
      setError('Failed to delete todo');
      throw err;
    }
  };

  // Apply filters
  const applyFilters = async (newFilters) => {
    setFilters(newFilters);
    await loadTodos(newFilters);
  };

  // Clear filters
  const clearFilters = async () => {
    const emptyFilters = { status: '', type: '', priority: '' };
    setFilters(emptyFilters);
    await loadTodos(emptyFilters);
  };

  // Get todos by status
  const getTodosByStatus = (status) => {
    return todos.filter(todo => todo.status === status);
  };

  // Get overdue todos
  const getOverdueTodos = () => {
    const now = new Date();
    return todos.filter(todo => 
      todo.deadline && 
      new Date(todo.deadline) < now && 
      todo.status !== 'done'
    );
  };

  // Load data on mount and when token changes
  useEffect(() => {
    if (token) {
      loadTodos();
      loadStats();
    }
  }, [token]);

  const value = {
    todos,
    stats,
    loading,
    error,
    filters,
    loadTodos,
    loadStats,
    createTodo,
    updateTodoStatus,
    updateTodo,
    deleteTodo,
    applyFilters,
    clearFilters,
    getTodosByStatus,
    getOverdueTodos,
    setError
  };

  return (
    <TodoContext.Provider value={value}>
      {children}
    </TodoContext.Provider>
  );
};
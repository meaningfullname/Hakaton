const BASE_URL = '/api/todos';

const todoService = {
  // Get user's todos with filters
  getTodos: async (token, filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.type) params.append('type', filters.type);
    if (filters.priority) params.append('priority', filters.priority);
    
    const url = params.toString() ? `${BASE_URL}?${params}` : BASE_URL;
    
    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!res.ok) throw new Error('Failed to fetch todos');
    return res.json();
  },

  // Get user's todo statistics
  getTodoStats: async (token) => {
    const res = await fetch(`${BASE_URL}/stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!res.ok) throw new Error('Failed to fetch todo stats');
    return res.json();
  },

  // Create a new personal todo
  createTodo: async (token, todoData) => {
    const res = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(todoData)
    });
    
    if (!res.ok) throw new Error('Failed to create todo');
    return res.json();
  },

  // Update todo status
  updateTodoStatus: async (token, todoId, status) => {
    const res = await fetch(`${BASE_URL}/${todoId}/status`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
    });
    
    if (!res.ok) throw new Error('Failed to update todo status');
    return res.json();
  },

  // Update todo (full update for personal todos)
  updateTodo: async (token, todoId, todoData) => {
    const res = await fetch(`${BASE_URL}/${todoId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(todoData)
    });
    
    if (!res.ok) throw new Error('Failed to update todo');
    return res.json();
  },

  // Delete todo (personal todos only)
  deleteTodo: async (token, todoId) => {
    const res = await fetch(`${BASE_URL}/${todoId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!res.ok) throw new Error('Failed to delete todo');
    return res.json();
  },

  // Admin APIs
  admin: {
    // Get all todos (admin view)
    getAllTodos: async (token, filters = {}, page = 1, limit = 50) => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      
      if (filters.assignedTo) params.append('assignedTo', filters.assignedTo);
      if (filters.status) params.append('status', filters.status);
      if (filters.type) params.append('type', filters.type);
      
      const res = await fetch(`${BASE_URL}/admin?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error('Failed to fetch admin todos');
      return res.json();
    },

    // Assign todo to student
    assignTodo: async (token, todoData) => {
      const res = await fetch(`${BASE_URL}/admin/assign`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(todoData)
      });
      
      if (!res.ok) throw new Error('Failed to assign todo');
      return res.json();
    },

    // Get admin todo statistics
    getAdminStats: async (token) => {
      const res = await fetch(`${BASE_URL}/admin/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error('Failed to fetch admin todo stats');
      return res.json();
    },

    // Update assigned todo
    updateAssignedTodo: async (token, todoId, todoData) => {
      const res = await fetch(`${BASE_URL}/admin/${todoId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(todoData)
      });
      
      if (!res.ok) throw new Error('Failed to update assigned todo');
      return res.json();
    },

    // Delete todo (admin can delete any todo)
    deleteTodo: async (token, todoId) => {
      const res = await fetch(`${BASE_URL}/admin/${todoId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error('Failed to delete todo');
      return res.json();
    }
  }
};

export default todoService;
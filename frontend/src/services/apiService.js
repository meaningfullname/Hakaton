
const apiService = {
    login: async (credentials) => {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      return res.json();
    },
    
    getProfile: async (token) => {
      const res = await fetch('/api/auth/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return res.json();
    },
    
    updateProfile: async (token, userId, data) => {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return res.json();
    },
    
    changePassword: async (token, data) => {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return res.json();
    },
    
    // Admin APIs
    getStats: async (token) => {
      const res = await fetch('/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch stats');
      return res.json();
    },
    
    getStudents: async (token, limit = 50, page = 1) => {
      const res = await fetch(`/api/admin/students?limit=${limit}&page=${page}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch students');
      return res.json();
    },
    
    createStudent: async (token, data) => {
      const res = await fetch('/api/admin/students', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to create student');
      return res.json();
    },
    
    updateStudent: async (token, id, data) => {
      const res = await fetch(`/api/admin/students/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to update student');
      return res.json();
    },
    
    deleteStudent: async (token, id) => {
      const res = await fetch(`/api/admin/students/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete student');
      return res.json();
    },
  
    // Get single student by ID
    getStudent: async (token, id) => {
      const res = await fetch(`/api/users/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch student');
      return res.json();
    }
  };
  
  export default apiService;
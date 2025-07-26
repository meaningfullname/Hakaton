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
      return res.json();
    },
    
    getStudents: async (token, limit = 50) => {
      const res = await fetch(`/api/admin/students?limit=${limit}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return res.json();
    },
    
    createStudent: async (token, data) => {
      const res = await fetch('/api/admin/students', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return res.json();
    },
    
    updateStudent: async (token, id, data) => {
      const res = await fetch(`/api/admin/students/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return res.json();
    },
    
    deleteStudent: async (token, id) => {
      const res = await fetch(`/api/admin/students/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return res.json();
    }
  };
  
  export default apiService;
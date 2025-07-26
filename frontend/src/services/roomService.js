const roomService = {
    // Get all rooms with optional filters
    getRooms: async (token, filters = {}) => {
      const queryParams = new URLSearchParams();
      
      if (filters.floor !== undefined) queryParams.append('floor', filters.floor);
      if (filters.building) queryParams.append('building', filters.building);
      if (filters.type) queryParams.append('type', filters.type);
      if (filters.status) queryParams.append('status', filters.status);
      
      const url = `/api/rooms${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error('Failed to fetch rooms');
      return res.json();
    },
  
    // Get specific room details
    getRoom: async (token, roomNumber) => {
      const res = await fetch(`/api/rooms/${roomNumber}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error('Failed to fetch room details');
      return res.json();
    },
  
    // Get room schedule
    getRoomSchedule: async (token, roomNumber, date = null) => {
      const url = `/api/rooms/${roomNumber}/schedule${date ? `?date=${date}` : ''}`;
      
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error('Failed to fetch room schedule');
      return res.json();
    },
  
    // Admin functions
    admin: {
      // Update room status
      updateRoomStatus: async (token, roomNumber, statusData) => {
        const res = await fetch(`/api/rooms/admin/${roomNumber}/status`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(statusData)
        });
        
        if (!res.ok) throw new Error('Failed to update room status');
        return res.json();
      },
  
      // Bulk update room statuses
      bulkUpdateRooms: async (token, updates) => {
        const res = await fetch('/api/rooms/admin/bulk-update', {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ updates })
        });
        
        if (!res.ok) throw new Error('Failed to bulk update rooms');
        return res.json();
      },
  
      // Create new room
      createRoom: async (token, roomData) => {
        const res = await fetch('/api/rooms/admin', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(roomData)
        });
        
        if (!res.ok) throw new Error('Failed to create room');
        return res.json();
      },
  
      // Update room details
      updateRoom: async (token, roomNumber, roomData) => {
        const res = await fetch(`/api/rooms/admin/${roomNumber}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(roomData)
        });
        
        if (!res.ok) throw new Error('Failed to update room');
        return res.json();
      },
  
      // Delete room
      deleteRoom: async (token, roomNumber) => {
        const res = await fetch(`/api/rooms/admin/${roomNumber}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!res.ok) throw new Error('Failed to delete room');
        return res.json();
      },
  
      // Get room statistics
      getRoomStats: async (token) => {
        const res = await fetch('/api/rooms/admin/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!res.ok) throw new Error('Failed to fetch room statistics');
        return res.json();
      }
    }
  };
  
  export default roomService;
import React, { useState, useEffect } from 'react';
import { MapPin, Filter, Grid, List, Plus, BarChart3 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import roomService from '../../services/roomService';
import RoomCard from '../features/rooms/RoomCard';
import RoomFilters from '../features/rooms/RoomFilters';
import RoomStats from '../features/rooms/RoomStats';
import RoomForm from '../features/rooms/RoomForm';
import Button from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';
import SuccessMessage from '../ui/SuccessMessage';
import ErrorMessage from '../ui/ErrorMessage';

const RoomsPage = () => {
  const { user, token } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [showFilters, setShowFilters] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  
  const [filters, setFilters] = useState({
    floor: '',
    building: '',
    type: '',
    status: '',
    search: ''
  });

  useEffect(() => {
    loadRooms();
    if (user?.role === 'admin') {
      loadStats();
    }
  }, []);

  useEffect(() => {
    applyFilters();
  }, [rooms, filters]);

  const loadRooms = async () => {
    try {
      setLoading(true);
      const roomsData = await roomService.getRooms(token);
      setRooms(roomsData);
    } catch (err) {
      setError('Failed to load rooms');
      console.error('Error loading rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await roomService.admin.getRoomStats(token);
      setStats(statsData);
    } catch (err) {
      console.error('Error loading room stats:', err);
    }
  };

  const applyFilters = () => {
    let filtered = rooms;

    // Apply filters
    if (filters.floor !== '') {
      filtered = filtered.filter(room => room.floor === parseInt(filters.floor));
    }
    if (filters.building) {
      filtered = filtered.filter(room => 
        room.building.toLowerCase().includes(filters.building.toLowerCase())
      );
    }
    if (filters.type) {
      filtered = filtered.filter(room => room.type === filters.type);
    }
    if (filters.status) {
      filtered = filtered.filter(room => room.currentStatus === filters.status);
    }
    if (filters.search) {
      filtered = filtered.filter(room =>
        room.roomNumber.toLowerCase().includes(filters.search.toLowerCase()) ||
        room.type.toLowerCase().includes(filters.search.toLowerCase()) ||
        room.equipment.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    setFilteredRooms(filtered);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const clearFilters = () => {
    setFilters({
      floor: '',
      building: '',
      type: '',
      status: '',
      search: ''
    });
  };

  const handleRoomStatusUpdate = async (roomNumber, statusData) => {
    if (user?.role !== 'admin') {
      setError('Admin access required to update room status');
      return;
    }

    try {
      await roomService.admin.updateRoomStatus(token, roomNumber, statusData);
      setMessage('Room status updated successfully');
      loadRooms();
      if (user?.role === 'admin') {
        loadStats();
      }
    } catch (err) {
      setError('Failed to update room status');
      console.error('Error updating room status:', err);
    }
  };

  const handleRoomCreate = async (roomData) => {
    try {
      await roomService.admin.createRoom(token, roomData);
      setMessage('Room created successfully');
      setShowRoomForm(false);
      loadRooms();
      if (user?.role === 'admin') {
        loadStats();
      }
    } catch (err) {
      setError('Failed to create room');
      console.error('Error creating room:', err);
    }
  };

  const handleRoomUpdate = async (roomNumber, roomData) => {
    try {
      await roomService.admin.updateRoom(token, roomNumber, roomData);
      setMessage('Room updated successfully');
      setShowRoomForm(false);
      setEditingRoom(null);
      loadRooms();
    } catch (err) {
      setError('Failed to update room');
      console.error('Error updating room:', err);
    }
  };

  const handleRoomDelete = async (roomNumber) => {
    if (!window.confirm('Are you sure you want to delete this room?')) {
      return;
    }

    try {
      await roomService.admin.deleteRoom(token, roomNumber);
      setMessage('Room deleted successfully');
      loadRooms();
      if (user?.role === 'admin') {
        loadStats();
      }
    } catch (err) {
      setError('Failed to delete room');
      console.error('Error deleting room:', err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'free': return '#28a745';
      case 'occupied': return '#dc3545';
      case 'reserved': return '#ffc107';
      case 'maintenance': return '#6c757d';
      default: return '#667eea';
    }
  };

  const getFloorName = (floor) => {
    return floor === 0 ? 'Ground Floor' : `Floor ${floor}`;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <MapPin size={32} style={{ color: '#667eea' }} />
          <h1 style={{ margin: 0, color: '#333', fontSize: '2rem' }}>
            Campus Rooms
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Button
            variant={showFilters ? 'primary' : 'secondary'}
            onClick={() => setShowFilters(!showFilters)}
            icon={<Filter size={16} />}
            size="small"
          >
            Filters
          </Button>

          {user?.role === 'admin' && (
            <>
              <Button
                variant={showStats ? 'primary' : 'secondary'}
                onClick={() => setShowStats(!showStats)}
                icon={<BarChart3 size={16} />}
                size="small"
              >
                Stats
              </Button>
              <Button
                variant="success"
                onClick={() => setShowRoomForm(true)}
                icon={<Plus size={16} />}
                size="small"
              >
                Add Room
              </Button>
            </>
          )}

          <div style={{ display: 'flex', background: '#f8f9fa', borderRadius: '6px' }}>
            <Button
              variant={viewMode === 'grid' ? 'primary' : 'secondary'}
              onClick={() => setViewMode('grid')}
              icon={<Grid size={16} />}
              size="small"
              style={{ borderRadius: '6px 0 0 6px' }}
            >
              Grid
            </Button>
            <Button
              variant={viewMode === 'list' ? 'primary' : 'secondary'}
              onClick={() => setViewMode('list')}
              icon={<List size={16} />}
              size="small"
              style={{ borderRadius: '0 6px 6px 0' }}
            >
              List
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      {message && <SuccessMessage message={message} onClose={() => setMessage('')} />}
      {error && <ErrorMessage message={error} onClose={() => setError('')} />}

      {/* Stats */}
      {showStats && user?.role === 'admin' && (
        <RoomStats stats={stats} getStatusColor={getStatusColor} />
      )}

      {/* Filters */}
      {showFilters && (
        <RoomFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
          rooms={rooms}
          getFloorName={getFloorName}
        />
      )}

      {/* Room Count and Status Summary */}
      <div style={{
        background: 'white',
        borderRadius: '10px',
        padding: '1rem',
        marginBottom: '1.5rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h3 style={{ margin: 0, color: '#333' }}>
            {filteredRooms.length} rooms found
            {filters.floor !== '' || filters.building || filters.type || filters.status || filters.search
              ? ` (filtered from ${rooms.length} total)`
              : ''
            }
          </h3>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {['free', 'occupied', 'reserved', 'maintenance'].map(status => {
            const count = filteredRooms.filter(room => room.currentStatus === status).length;
            return (
              <div
                key={status}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '14px'
                }}
              >
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: getStatusColor(status)
                  }}
                />
                <span style={{ textTransform: 'capitalize' }}>{status}: {count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rooms Display */}
      {filteredRooms.length === 0 ? (
        <div style={{
          background: 'white',
          borderRadius: '10px',
          padding: '3rem',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <MapPin size={64} style={{ color: '#ccc', marginBottom: '1rem' }} />
          <h3 style={{ color: '#666', marginBottom: '0.5rem' }}>No rooms found</h3>
          <p style={{ color: '#999', margin: 0 }}>
            {filters.floor !== '' || filters.building || filters.type || filters.status || filters.search
              ? 'Try adjusting your filters'
              : 'No rooms are available'
            }
          </p>
        </div>
      ) : (
        <div style={{
          display: viewMode === 'grid' ? 'grid' : 'flex',
          ...(viewMode === 'grid' && {
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '1.5rem'
          }),
          ...(viewMode === 'list' && {
            flexDirection: 'column',
            gap: '1rem'
          })
        }}>
          {filteredRooms.map((room) => (
            <RoomCard
              key={room._id}
              room={room}
              viewMode={viewMode}
              isAdmin={user?.role === 'admin'}
              onStatusUpdate={handleRoomStatusUpdate}
              onEdit={(room) => {
                setEditingRoom(room);
                setShowRoomForm(true);
              }}
              onDelete={() => handleRoomDelete(room.roomNumber)}
              getStatusColor={getStatusColor}
              getFloorName={getFloorName}
            />
          ))}
        </div>
      )}

      {/* Room Form Modal */}
      {showRoomForm && (
        <RoomForm
          room={editingRoom}
          isOpen={showRoomForm}
          onSubmit={editingRoom ? 
            (data) => handleRoomUpdate(editingRoom.roomNumber, data) : 
            handleRoomCreate
          }
          onCancel={() => {
            setShowRoomForm(false);
            setEditingRoom(null);
          }}
          rooms={rooms}
        />
      )}
    </div>
  );
};

export default RoomsPage;
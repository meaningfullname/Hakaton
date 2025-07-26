import React, { useState, useEffect } from 'react';
import { 
  Map, 
  MapPin, 
  Filter, 
  Grid, 
  List, 
  Plus, 
  BarChart3,
  Building,
  Navigation,
  Search,
  Eye,
  Settings
} from 'lucide-react';
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

const MapPage = () => {
  const { user, token } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('map'); // 'map', 'grid', 'list'
  const [showFilters, setShowFilters] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [selectedFloor, setSelectedFloor] = useState(0);
  const [selectedRoom, setSelectedRoom] = useState(null);
  
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
    } else if (viewMode === 'map') {
      // In map mode, show only selected floor
      filtered = filtered.filter(room => room.floor === selectedFloor);
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

  const getUniqueFloors = () => {
    return [...new Set(rooms.map(room => room.floor))].sort((a, b) => a - b);
  };

  // Map view component
  const MapView = () => {
    const currentFloorRooms = filteredRooms;
    
    return (
      <div style={{
        background: 'white',
        borderRadius: '10px',
        padding: '1.5rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        minHeight: '600px'
      }}>
        {/* Floor selector */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>
              Floor Plan - {getFloorName(selectedFloor)}
            </h3>
            <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
              {currentFloorRooms.length} rooms on this floor
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {getUniqueFloors().map(floor => (
              <Button
                key={floor}
                variant={selectedFloor === floor ? 'primary' : 'secondary'}
                size="small"
                onClick={() => setSelectedFloor(floor)}
              >
                {getFloorName(floor)}
              </Button>
            ))}
          </div>
        </div>

        {/* Map grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '10px',
          padding: '20px',
          background: '#f8f9fa',
          borderRadius: '8px',
          minHeight: '400px',
          border: '2px solid #e9ecef'
        }}>
          {currentFloorRooms.length === 0 ? (
            <div style={{
              gridColumn: '1 / -1',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2rem',
              color: '#666'
            }}>
              <Building size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <p>No rooms found on {getFloorName(selectedFloor)}</p>
            </div>
          ) : (
            currentFloorRooms.map((room) => (
              <div
                key={room._id}
                onClick={() => setSelectedRoom(room)}
                style={{
                  background: 'white',
                  border: `3px solid ${getStatusColor(room.currentStatus)}`,
                  borderRadius: '8px',
                  padding: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  minHeight: '80px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  textAlign: 'center'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.05)';
                  e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  fontWeight: 'bold',
                  fontSize: '14px',
                  color: '#333',
                  marginBottom: '4px'
                }}>
                  {room.roomNumber}
                </div>
                <div style={{
                  fontSize: '10px',
                  color: '#666',
                  marginBottom: '4px'
                }}>
                  {room.type.length > 15 ? `${room.type.substring(0, 15)}...` : room.type}
                </div>
                <div style={{
                  fontSize: '10px',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  background: getStatusColor(room.currentStatus),
                  color: 'white',
                  fontWeight: 'bold',
                  textTransform: 'uppercase'
                }}>
                  {room.currentStatus}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Room details sidebar */}
        {selectedRoom && (
          <div style={{
            marginTop: '1.5rem',
            padding: '1rem',
            background: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #dee2e6'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '1rem'
            }}>
              <h4 style={{ margin: 0, color: '#333' }}>
                Room {selectedRoom.roomNumber} Details
              </h4>
              <Button
                variant="secondary"
                size="small"
                onClick={() => setSelectedRoom(null)}
              >
                ✕
              </Button>
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem'
            }}>
              <div>
                <strong>Type:</strong> {selectedRoom.type}<br />
                <strong>Capacity:</strong> {selectedRoom.capacity} people<br />
                <strong>Building:</strong> {selectedRoom.building}
              </div>
              <div>
                <strong>Status:</strong> 
                <span style={{
                  marginLeft: '8px',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  background: getStatusColor(selectedRoom.currentStatus),
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  textTransform: 'uppercase'
                }}>
                  {selectedRoom.currentStatus}
                </span>
              </div>
            </div>
            
            <div style={{ marginTop: '1rem' }}>
              <strong>Equipment:</strong>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '14px', color: '#666' }}>
                {selectedRoom.equipment}
              </p>
            </div>
          </div>
        )}
      </div>
    );
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
          <Map size={32} style={{ color: '#667eea' }} />
          <h1 style={{ margin: 0, color: '#333', fontSize: '2rem' }}>
            Campus Map & Rooms
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
              variant={viewMode === 'map' ? 'primary' : 'secondary'}
              onClick={() => setViewMode('map')}
              icon={<Navigation size={16} />}
              size="small"
              style={{ borderRadius: '6px 0 0 6px' }}
            >
              Map
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'primary' : 'secondary'}
              onClick={() => setViewMode('grid')}
              icon={<Grid size={16} />}
              size="small"
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

      {/* Content based on view mode */}
      {viewMode === 'map' ? (
        <MapView />
      ) : (
        <>
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
        </>
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

export default MapPage;
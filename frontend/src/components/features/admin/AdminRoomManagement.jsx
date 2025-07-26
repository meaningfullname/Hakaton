import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Plus, 
  BarChart3, 
  Settings, 
  MapPin,
  Users,
  Activity,
  Wrench,
  Calendar,
  Building,
  Search,
  Edit,
  Trash2
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import roomService from '../../../services/roomService';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import SuccessMessage from '../../ui/SuccessMessage';
import ErrorMessage from '../../ui/ErrorMessage';
import LoadingSpinner from '../../ui/LoadingSpinner';
import RoomForm from '../rooms/RoomForm';
import RoomStatusBadge from '../rooms/RoomStatusBadge';

const AdminRoomManagement = () => {
  const { token } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [showBulkUpdate, setShowBulkUpdate] = useState(false);
  const [selectedRooms, setSelectedRooms] = useState(new Set());
  const [bulkStatus, setBulkStatus] = useState('');
  
  const [filters, setFilters] = useState({
    search: '',
    floor: '',
    building: '',
    type: '',
    status: ''
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0
  });

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [roomsData, statsData] = await Promise.all([
        roomService.getRooms(token, filters),
        roomService.admin.getRoomStats(token)
      ]);
      
      setRooms(roomsData);
      setStats(statsData);
    } catch (err) {
      setError('Failed to load room data');
      console.error('Error loading room data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoomCreate = async (roomData) => {
    try {
      await roomService.admin.createRoom(token, roomData);
      setMessage('Room created successfully!');
      setShowRoomForm(false);
      loadData();
    } catch (err) {
      setError('Failed to create room');
      console.error('Error creating room:', err);
    }
  };

  const handleRoomUpdate = async (roomNumber, roomData) => {
    try {
      await roomService.admin.updateRoom(token, roomNumber, roomData);
      setMessage('Room updated successfully!');
      setShowRoomForm(false);
      setEditingRoom(null);
      loadData();
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
      setMessage('Room deleted successfully!');
      loadData();
    } catch (err) {
      setError('Failed to delete room');
      console.error('Error deleting room:', err);
    }
  };

  const handleStatusUpdate = async (roomNumber, statusData) => {
    try {
      await roomService.admin.updateRoomStatus(token, roomNumber, statusData);  
      setMessage('Room status updated successfully!');
      loadData();
    } catch (err) {
      setError('Failed to update room status');
      console.error('Error updating room status:', err);
    }
  };

  const handleBulkStatusUpdate = async () => {
    if (selectedRooms.size === 0 || !bulkStatus) {
      setError('Please select rooms and status for bulk update');
      return;
    }

    try {
      const updates = Array.from(selectedRooms).map(roomNumber => ({
        roomNumber,
        status: bulkStatus
      }));

      await roomService.admin.bulkUpdateRooms(token, updates);
      setMessage(`Bulk update completed for ${selectedRooms.size} rooms`);
      setSelectedRooms(new Set());
      setBulkStatus('');
      setShowBulkUpdate(false);
      loadData();
    } catch (err) {
      setError('Failed to perform bulk update');
      console.error('Error in bulk update:', err);
    }
  };

  const handleRoomSelect = (roomNumber) => {
    const newSelected = new Set(selectedRooms);
    if (newSelected.has(roomNumber)) {
      newSelected.delete(roomNumber);
    } else {
      newSelected.add(roomNumber);
    }
    setSelectedRooms(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedRooms.size === rooms.length) {
      setSelectedRooms(new Set());
    } else {
      setSelectedRooms(new Set(rooms.map(room => room.roomNumber)));
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

  const filteredRooms = rooms.filter(room => {
    return (
      (!filters.search || 
        room.roomNumber.toLowerCase().includes(filters.search.toLowerCase()) ||
        room.type.toLowerCase().includes(filters.search.toLowerCase()) ||
        room.equipment.toLowerCase().includes(filters.search.toLowerCase())
      ) &&
      (!filters.floor || room.floor === parseInt(filters.floor)) &&
      (!filters.building || room.building.toLowerCase().includes(filters.building.toLowerCase())) &&
      (!filters.type || room.type === filters.type) &&
      (!filters.status || room.currentStatus === filters.status)
    );
  });

  const renderStatsCards = () => (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem',
      marginBottom: '2rem'
    }}>
      {[
        { label: 'Total Rooms', value: stats.total, color: '#667eea', icon: <Home size={24} /> },
        { label: 'Available', value: stats.free, color: '#28a745', icon: <Activity size={24} /> },
        { label: 'Occupied', value: stats.occupied, color: '#dc3545', icon: <Users size={24} /> },
        { label: 'Reserved', value: stats.reserved, color: '#ffc107', icon: <Calendar size={24} /> },
        { label: 'Maintenance', value: stats.maintenance, color: '#6c757d', icon: <Wrench size={24} /> }
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
      <h3 style={{ marginBottom: '1rem', color: '#333' }}>Filters & Search</h3>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        alignItems: 'end'
      }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', fontWeight: '500' }}>
            Search
          </label>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{
              position: 'absolute',
              left: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#999'
            }} />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              placeholder="Room number, type, equipment..."
              style={{
                width: '100%',
                padding: '0.6rem 0.6rem 0.6rem 30px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '14px'
              }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', fontWeight: '500' }}>
            Floor
          </label>
          <select
            value={filters.floor}
            onChange={(e) => setFilters({...filters, floor: e.target.value})}
            style={{
              width: '100%',
              padding: '0.6rem',
              border: '1px solid #ddd',
              borderRadius: '5px',
              fontSize: '14px'
            }}
          >
            <option value="">All Floors</option>
            <option value="0">Ground Floor</option>
            {[...Array(10)].map((_, i) => (
              <option key={i + 1} value={i + 1}>Floor {i + 1}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', fontWeight: '500' }}>
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
            style={{
              width: '100%',
              padding: '0.6rem',
              border: '1px solid #ddd',
              borderRadius: '5px',
              fontSize: '14px'
            }}
          >
            <option value="">All Statuses</option>
            <option value="free">Available</option>
            <option value="occupied">Occupied</option>
            <option value="reserved">Reserved</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>

        <div>
          <Button
            onClick={() => setFilters({ search: '', floor: '', building: '', type: '', status: '' })}
            variant="secondary"
            size="small"
          >
            Clear Filters
          </Button>
        </div>
      </div>
    </div>
  );

  const renderBulkActions = () => (
    <div style={{
      background: 'white',
      borderRadius: '10px',
      padding: '1.5rem',
      marginBottom: '1.5rem',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem'
      }}>
        <h3 style={{ margin: 0, color: '#333' }}>
          Bulk Actions ({selectedRooms.size} selected)
        </h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button
            onClick={handleSelectAll}
            variant="secondary"
            size="small"
          >
            {selectedRooms.size === rooms.length ? 'Deselect All' : 'Select All'}
          </Button>
          <Button
            onClick={() => setShowBulkUpdate(!showBulkUpdate)}
            variant="primary"
            size="small"
            disabled={selectedRooms.size === 0}
          >
            Bulk Update Status
          </Button>
        </div>
      </div>

      {showBulkUpdate && selectedRooms.size > 0 && (
        <div style={{
          display: 'flex',
          gap: '1rem',
          alignItems: 'end',
          padding: '1rem',
          background: '#f8f9fa',
          borderRadius: '8px'
        }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', fontWeight: '500' }}>
              New Status
            </label>
            <select
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value)}
              style={{
                padding: '0.6rem',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '14px'
              }}
            >
              <option value="">Select status...</option>
              <option value="free">Available</option>
              <option value="occupied">Occupied</option>
              <option value="reserved">Reserved</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
          <Button
            onClick={handleBulkStatusUpdate}
            variant="primary"
            size="small"
            disabled={!bulkStatus}
          >
            Update {selectedRooms.size} Rooms
          </Button>
          <Button
            onClick={() => setShowBulkUpdate(false)}
            variant="secondary"
            size="small"
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  );

  const renderRoomsTable = () => (
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
          Room Management ({filteredRooms.length} rooms)
        </h3>
        <Button
          onClick={() => setShowRoomForm(true)}
          icon={<Plus size={16} />}
          variant="success"
        >
          Add New Room
        </Button>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f8f9fa' }}>
            <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>
              <input
                type="checkbox"
                checked={selectedRooms.size === filteredRooms.length && filteredRooms.length > 0}
                onChange={handleSelectAll}
              />
            </th>
            <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Room</th>
            <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Location</th>
            <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Type</th>
            <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Capacity</th>
            <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Status</th>
            <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Last Updated</th>
            <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredRooms.map((room, index) => (
            <tr key={room._id} style={{
              background: index % 2 === 0 ? 'white' : '#f8f9fa'
            }}>
              <td style={{ padding: '1rem', borderBottom: '1px solid #dee2e6' }}>
                <input
                  type="checkbox"
                  checked={selectedRooms.has(room.roomNumber)}
                  onChange={() => handleRoomSelect(room.roomNumber)}
                />
              </td>
              <td style={{ padding: '1rem', borderBottom: '1px solid #dee2e6' }}>
                <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                  {room.roomNumber}
                </div>
              </td>
              <td style={{ padding: '1rem', borderBottom: '1px solid #dee2e6' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                  <Building size={14} />
                  {room.building}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', color: '#666' }}>
                  <MapPin size={14} />
                  {room.floor === 0 ? 'Ground Floor' : `Floor ${room.floor}`}
                </div>
              </td>
              <td style={{ padding: '1rem', borderBottom: '1px solid #dee2e6' }}>
                <div style={{ fontSize: '14px' }}>{room.type}</div>
              </td>
              <td style={{ padding: '1rem', borderBottom: '1px solid #dee2e6' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Users size={14} />
                  {room.capacity}
                </div>
              </td>
              <td style={{ padding: '1rem', borderBottom: '1px solid #dee2e6' }}>
                <RoomStatusBadge 
                  status={room.currentStatus} 
                  getStatusColor={getStatusColor}
                />
              </td>
              <td style={{ padding: '1rem', borderBottom: '1px solid #dee2e6' }}>
                {room.lastUpdated ? (
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {new Date(room.lastUpdated).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                    {room.updatedBy && (
                      <div>by {room.updatedBy.firstName} {room.updatedBy.lastName}</div>
                    )}
                  </div>
                ) : (
                  <span style={{ color: '#999' }}>Never</span>
                )}
              </td>
              <td style={{ padding: '1rem', borderBottom: '1px solid #dee2e6' }}>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <Button
                    onClick={() => {
                      // Quick status toggle
                      const newStatus = room.currentStatus === 'free' ? 'occupied' : 'free';
                      handleStatusUpdate(room.roomNumber, { status: newStatus });
                    }}
                    variant="primary"
                    size="small"
                    icon={<Settings size={14} />}
                  >
                    Toggle
                  </Button>
                  <Button
                    onClick={() => {
                      setEditingRoom(room);
                      setShowRoomForm(true);
                    }}
                    variant="warning"
                    size="small"
                    icon={<Edit size={14} />}
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleRoomDelete(room.roomNumber)}
                    variant="danger"
                    size="small"
                    icon={<Trash2 size={14} />}
                  >
                    Delete
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {filteredRooms.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '2rem',
          color: '#666'
        }}>
          No rooms found matching your criteria.
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
        Room Management
      </h2>

      {/* Messages */}
      {message && <SuccessMessage message={message} onClose={() => setMessage('')} />}
      {error && <ErrorMessage message={error} onClose={() => setError('')} />}

      {/* Stats Cards */}
      {renderStatsCards()}

      {/* Filters */}
      {renderFilters()}

      {/* Bulk Actions */}
      {renderBulkActions()}

      {/* Rooms Table */}
      {renderRoomsTable()}

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

export default AdminRoomManagement;
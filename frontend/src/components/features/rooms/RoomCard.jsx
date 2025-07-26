
import React, { useState } from 'react';
import { 
  MapPin, 
  Users, 
  Settings, 
  Clock, 
  Edit, 
  Trash2, 
  Calendar,
  Building,
  Monitor
} from 'lucide-react';
import Button from '../../ui/Button';
import RoomStatusBadge from './RoomStatusBadge';

const RoomCard = ({ 
  room, 
  viewMode, 
  isAdmin, 
  onStatusUpdate, 
  onEdit, 
  onDelete, 
  getStatusColor,
  getFloorName 
}) => {
  const [showStatusForm, setShowStatusForm] = useState(false);
  const [statusFormData, setStatusFormData] = useState({
    status: room.currentStatus,
    startTime: '',
    endTime: '',
    purpose: ''
  });

  const handleStatusUpdate = (e) => {
    e.preventDefault();
    const updateData = {
      status: statusFormData.status,
      ...(statusFormData.startTime && statusFormData.endTime && {
        startTime: statusFormData.startTime,
        endTime: statusFormData.endTime
      }),
      ...(statusFormData.purpose && { purpose: statusFormData.purpose })
    };

    onStatusUpdate(room.roomNumber, updateData);
    setShowStatusForm(false);
    setStatusFormData({
      status: room.currentStatus,
      startTime: '',
      endTime: '',
      purpose: ''
    });
  };

  const formatLastUpdated = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (viewMode === 'list') {
    return (
      <div style={{
        background: 'white',
        borderRadius: '10px',
        padding: '1.5rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        borderLeft: `4px solid ${getStatusColor(room.currentStatus)}`
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr auto auto',
          gap: '1.5rem',
          alignItems: 'center'
        }}>
          {/* Room Info */}
          <div>
            <h3 style={{ 
              margin: '0 0 0.5rem 0', 
              color: '#333',
              fontSize: '1.2rem',
              fontWeight: 'bold'
            }}>
              {room.roomNumber}
            </h3>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '4px',
              color: '#666',
              fontSize: '14px',
              marginBottom: '0.25rem'
            }}>
              <Building size={14} />
              {room.building} • {getFloorName(room.floor)}
            </div>
            <div style={{ color: '#888', fontSize: '14px' }}>
              {room.type}
            </div>
          </div>

          {/* Details */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem'
          }}>
            <div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '4px',
                marginBottom: '0.25rem'
              }}>
                <Users size={14} style={{ color: '#667eea' }} />
                <span style={{ fontSize: '14px', fontWeight: '500' }}>
                  Capacity: {room.capacity}
                </span>
              </div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '4px'
              }}>
                <Monitor size={14} style={{ color: '#667eea' }} />
                <span style={{ fontSize: '14px', color: '#666' }}>
                  {room.equipment.length > 50 
                    ? `${room.equipment.substring(0, 50)}...` 
                    : room.equipment
                  }
                </span>
              </div>
            </div>

            {room.lastUpdated && (
              <div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '4px',
                  fontSize: '12px',
                  color: '#888'
                }}>
                  <Clock size={12} />
                  Last updated: {formatLastUpdated(room.lastUpdated)}
                </div>
                {room.updatedBy && (
                  <div style={{ fontSize: '12px', color: '#888' }}>
                    by {room.updatedBy.firstName} {room.updatedBy.lastName}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Status */}
          <div style={{ textAlign: 'center' }}>
            <RoomStatusBadge 
              status={room.currentStatus} 
              getStatusColor={getStatusColor}
              size="large"
            />
          </div>

          {/* Actions */}
          {isAdmin && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button
                variant="primary"
                size="small"
                onClick={() => setShowStatusForm(!showStatusForm)}
                icon={<Settings size={14} />}
              >
                Status
              </Button>
              <Button
                variant="warning"
                size="small"
                onClick={() => onEdit(room)}
                icon={<Edit size={14} />}
              >
                Edit
              </Button>
              <Button
                variant="danger"
                size="small"
                onClick={onDelete}
                icon={<Trash2 size={14} />}
              >
                Delete
              </Button>
            </div>
          )}
        </div>

        {/* Status Update Form */}
        {showStatusForm && isAdmin && (
          <div style={{
            marginTop: '1.5rem',
            padding: '1rem',
            background: '#f8f9fa',
            borderRadius: '8px',
            borderTop: '1px solid #dee2e6'
          }}>
            <form onSubmit={handleStatusUpdate}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '1rem',
                marginBottom: '1rem'
              }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.25rem',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}>
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={statusFormData.startTime}
                    onChange={(e) => setStatusFormData({
                      ...statusFormData, 
                      startTime: e.target.value
                    })}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.25rem',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}>
                    End Time
                  </label>
                  <input
                    type="time"
                    value={statusFormData.endTime}
                    onChange={(e) => setStatusFormData({
                      ...statusFormData, 
                      endTime: e.target.value
                    })}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.25rem',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}>
                    Purpose
                  </label>
                  <input
                    type="text"
                    value={statusFormData.purpose}
                    onChange={(e) => setStatusFormData({
                      ...statusFormData, 
                      purpose: e.target.value
                    })}
                    placeholder="Optional purpose..."
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <Button
                  type="button"
                  variant="secondary"
                  size="small"
                  onClick={() => setShowStatusForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="small"
                >
                  Update Status
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    );
  }

  // Grid view
  return (
    <div style={{
      background: 'white',
      borderRadius: '10px',
      padding: '1.5rem',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      borderTop: `4px solid ${getStatusColor(room.currentStatus)}`,
      height: 'fit-content',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease'
    }}
    onMouseEnter={(e) => {
      e.target.style.transform = 'translateY(-2px)';
      e.target.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)';
    }}
    onMouseLeave={(e) => {
      e.target.style.transform = 'translateY(0)';
      e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
    }}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '1rem'
      }}>
        <div>
          <h3 style={{ 
            margin: '0 0 0.5rem 0', 
            color: '#333',
            fontSize: '1.3rem',
            fontWeight: 'bold'
          }}>
            {room.roomNumber}
          </h3>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '4px',
            color: '#666',
            fontSize: '14px',
            marginBottom: '0.25rem'
          }}>
            <Building size={14} />
            {room.building}
          </div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '4px',
            color: '#666',
            fontSize: '14px'
          }}>
            <MapPin size={14} />
            {getFloorName(room.floor)}
          </div>
        </div>

        <RoomStatusBadge 
          status={room.currentStatus} 
          getStatusColor={getStatusColor}
        />
      </div>

      {/* Room Type */}
      <div style={{
        background: '#f8f9fa',
        padding: '0.5rem 0.75rem',
        borderRadius: '6px',
        marginBottom: '1rem',
        textAlign: 'center'
      }}>
        <span style={{ 
          fontSize: '14px', 
          fontWeight: '500',
          color: '#495057'
        }}>
          {room.type}
        </span>
      </div>

      {/* Details */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          marginBottom: '0.5rem'
        }}>
          <Users size={16} style={{ color: '#667eea' }} />
          <span style={{ fontSize: '14px', fontWeight: '500' }}>
            Capacity: {room.capacity}
          </span>
        </div>

        <div style={{ 
          display: 'flex', 
          alignItems: 'flex-start', 
          gap: '8px'
        }}>
          <Monitor size={16} style={{ color: '#667eea', marginTop: '2px' }} />
          <div>
            <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '0.25rem' }}>
              Equipment:
            </div>
            <div style={{ 
              fontSize: '13px', 
              color: '#666',
              lineHeight: '1.4'
            }}>
              {room.equipment}
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Preview */}
      {room.schedule && room.schedule.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '4px',
            marginBottom: '0.5rem'
          }}>
            <Calendar size={14} style={{ color: '#667eea' }} />
            <span style={{ fontSize: '14px', fontWeight: '500' }}>
              Today's Schedule
            </span>
          </div>
          <div style={{ 
            maxHeight: '80px', 
            overflowY: 'auto',
            fontSize: '12px'
          }}>
            {room.schedule.slice(0, 3).map((slot, index) => (
              <div key={index} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.25rem 0',
                borderBottom: index < room.schedule.length - 1 ? '1px solid #eee' : 'none'
              }}>
                <span>{slot.startTime} - {slot.endTime}</span>
                <RoomStatusBadge 
                  status={slot.status} 
                  getStatusColor={getStatusColor}
                  size="small"
                />
              </div>
            ))}
            {room.schedule.length > 3 && (
              <div style={{ color: '#888', textAlign: 'center', padding: '0.25rem 0' }}>
                +{room.schedule.length - 3} more slots
              </div>
            )}
          </div>
        </div>
      )}

      {/* Last Updated */}
      {room.lastUpdated && (
        <div style={{
          fontSize: '12px',
          color: '#888',
          marginBottom: '1rem',
          paddingTop: '0.5rem',
          borderTop: '1px solid #eee'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={12} />
            Updated: {formatLastUpdated(room.lastUpdated)}
          </div>
          {room.updatedBy && (
            <div style={{ marginTop: '0.25rem' }}>
              by {room.updatedBy.firstName} {room.updatedBy.lastName}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      {isAdmin && (
        <div style={{ 
          display: 'flex', 
          gap: '8px',
          flexWrap: 'wrap'
        }}>
          <Button
            variant="primary"
            size="small"
            onClick={() => setShowStatusForm(!showStatusForm)}
            icon={<Settings size={14} />}
            style={{ flex: '1', minWidth: '80px' }}
          >
            Status
          </Button>
          <Button
            variant="warning"
            size="small"
            onClick={() => onEdit(room)}
            icon={<Edit size={14} />}
            style={{ flex: '1', minWidth: '70px' }}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            size="small"
            onClick={onDelete}
            icon={<Trash2 size={14} />}
            style={{ flex: '1', minWidth: '80px' }}
          >
            Delete
          </Button>
        </div>
      )}

      {/* Status Update Form */}
      {showStatusForm && isAdmin && (
        <div style={{
          marginTop: '1.5rem',
          padding: '1rem',
          background: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #dee2e6'
        }}>
          <h4 style={{ margin: '0 0 1rem 0', fontSize: '16px' }}>Update Status</h4>
          <form onSubmit={handleStatusUpdate}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                Status
              </label>
              <select
                value={statusFormData.status}
                onChange={(e) => setStatusFormData({
                  ...statusFormData, 
                  status: e.target.value
                })}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                <option value="free">Free</option>
                <option value="occupied">Occupied</option>
                <option value="reserved">Reserved</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.5rem',
              marginBottom: '1rem'
            }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.25rem',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  Start Time
                </label>
                <input
                  type="time"
                  value={statusFormData.startTime}
                  onChange={(e) => setStatusFormData({
                    ...statusFormData, 
                    startTime: e.target.value
                  })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.25rem',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  End Time
                </label>
                <input
                  type="time"
                  value={statusFormData.endTime}
                  onChange={(e) => setStatusFormData({
                    ...statusFormData, 
                    endTime: e.target.value
                  })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.25rem',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                Purpose (Optional)
              </label>
              <input
                type="text"
                value={statusFormData.purpose}
                onChange={(e) => setStatusFormData({
                  ...statusFormData, 
                  purpose: e.target.value
                })}
                placeholder="e.g., Lecture, Meeting, Maintenance..."
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <Button
                type="button"
                variant="secondary"
                size="small"
                onClick={() => setShowStatusForm(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="small"
              >
                Update
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default RoomCard;
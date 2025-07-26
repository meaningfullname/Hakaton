import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Button from '../../ui/Button';
import Input from '../../ui/Input';

const RoomForm = ({ room, isOpen, onSubmit, onCancel, rooms }) => {
  const [formData, setFormData] = useState({
    roomNumber: '',
    floor: '',
    building: 'Main Building',
    type: '',
    capacity: '',
    equipment: ''
  });
  const [errors, setErrors] = useState({});

  const roomTypes = [
    'Lecture Theatre',
    'Seminar Room', 
    'Computer Lab',
    'Physics Laboratory',
    'Chemistry Laboratory',
    'Assembly Hall',
    'Library',
    'Dean\'s Office',
    'Cafeteria',
    'IT Laboratory',
    'Conference Room',
    'Electronics Laboratory',
    'Multimedia Room',
    'Mathematics Room',
    'Language Laboratory',
    'Programming Department',
    'Research Laboratory',
    'Meeting Room',
    'Archive',
    'Server Room',
    'Vice-Chancellor\'s Office',
    'Council Chamber',
    'Teaching Resource Centre',
    'Design Studio',
    'Study Room'
  ];

  useEffect(() => {
    if (room) {
      setFormData({
        roomNumber: room.roomNumber || '',
        floor: room.floor?.toString() || '',
        building: room.building || 'Main Building',
        type: room.type || '',
        capacity: room.capacity?.toString() || '',
        equipment: room.equipment || ''
      });
    } else {
      setFormData({
        roomNumber: '',
        floor: '',
        building: 'Main Building',
        type: '',
        capacity: '',
        equipment: ''
      });
    }
    setErrors({});
  }, [room, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    // Room Number validation
    if (!formData.roomNumber.trim()) {
      newErrors.roomNumber = 'Room number is required';
    } else if (formData.roomNumber.length > 10) {
      newErrors.roomNumber = 'Room number must be less than 10 characters';
    } else {
      // Check for duplicate room numbers (only for new rooms)
      if (!room && rooms.some(r => r.roomNumber === formData.roomNumber.trim())) {
        newErrors.roomNumber = 'Room number already exists';
      }
    }

    // Floor validation
    if (!formData.floor) {
      newErrors.floor = 'Floor is required';
    } else {
      const floorNum = parseInt(formData.floor);
      if (isNaN(floorNum) || floorNum < 0 || floorNum > 10) {
        newErrors.floor = 'Floor must be between 0 and 10';
      }
    }

    // Building validation
    if (!formData.building.trim()) {
      newErrors.building = 'Building is required';
    } else if (formData.building.length > 50) {
      newErrors.building = 'Building name must be less than 50 characters';
    }

    // Type validation
    if (!formData.type) {
      newErrors.type = 'Room type is required';
    }

    // Capacity validation
    if (!formData.capacity) {
      newErrors.capacity = 'Capacity is required';
    } else {
      const capacity = parseInt(formData.capacity);
      if (isNaN(capacity) || capacity < 0 || capacity > 1000) {
        newErrors.capacity = 'Capacity must be between 0 and 1000';
      }
    }

    // Equipment validation
    if (!formData.equipment.trim()) {
      newErrors.equipment = 'Equipment description is required';
    } else if (formData.equipment.length > 500) {
      newErrors.equipment = 'Equipment description must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const submitData = {
      ...formData,
      roomNumber: formData.roomNumber.trim(),
      floor: parseInt(formData.floor),
      building: formData.building.trim(),
      capacity: parseInt(formData.capacity),
      equipment: formData.equipment.trim()
    };

    onSubmit(submitData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '10px',
        padding: '2rem',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}>
          <h2 style={{ margin: 0, color: '#333' }}>
            {room ? 'Edit Room' : 'Create New Room'}
          </h2>
          <button
            onClick={onCancel}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666'
            }}
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1rem',
            marginBottom: '1rem'
          }}>
            <Input
              label="Room Number"
              type="text"
              value={formData.roomNumber}
              onChange={(e) => handleChange('roomNumber', e.target.value)}
              placeholder="e.g., G01, 101, 201A"
              required
              error={errors.roomNumber}
              disabled={!!room} // Disable editing room number for existing rooms
            />

            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#555',
                fontWeight: '500'
              }}>
                Floor *
              </label>
              <select
                value={formData.floor}
                onChange={(e) => handleChange('floor', e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  border: `1px solid ${errors.floor ? '#dc3545' : '#ddd'}`,
                  borderRadius: '5px',
                  fontSize: '1rem',
                  background: 'white'
                }}
              >
                <option value="">Select floor...</option>
                <option value="0">Ground Floor</option>
                {[...Array(10)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>Floor {i + 1}</option>
                ))}
              </select>
              {errors.floor && (
                <div style={{ color: '#dc3545', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                  {errors.floor}
                </div>
              )}
            </div>
          </div>

          <Input
            label="Building"
            type="text"
            value={formData.building}
            onChange={(e) => handleChange('building', e.target.value)}
            placeholder="e.g., Main Building, Science Block"
            required
            error={errors.building}
          />

          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: '#555',
              fontWeight: '500'
            }}>
              Room Type *
            </label>
            <select
              value={formData.type}
              onChange={(e) => handleChange('type', e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.8rem',
                border: `1px solid ${errors.type ? '#dc3545' : '#ddd'}`,
                borderRadius: '5px',
                fontSize: '1rem',
                background: 'white'
              }}
            >
              <option value="">Select room type...</option>
              {roomTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {errors.type && (
              <div style={{ color: '#dc3545', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                {errors.type}
              </div>
            )}
          </div>

          <Input
            label="Capacity"
            type="number"
            value={formData.capacity}
            onChange={(e) => handleChange('capacity', e.target.value)}
            placeholder="Maximum number of people"
            required
            min="0"
            max="1000"
            error={errors.capacity}
          />

          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: '#555',
              fontWeight: '500'
            }}>
              Equipment & Facilities *
            </label>
            <textarea
              value={formData.equipment}
              onChange={(e) => handleChange('equipment', e.target.value)}
              placeholder="Describe available equipment and facilities..."
              rows="4"
              required
              style={{
                width: '100%',
                padding: '0.8rem',
                border: `1px solid ${errors.equipment ? '#dc3545' : '#ddd'}`,
                borderRadius: '5px',
                fontSize: '1rem',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
            />
            {errors.equipment && (
              <div style={{ color: '#dc3545', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                {errors.equipment}
              </div>
            )}
          </div>

          {/* Form Summary */}
          <div style={{
            background: '#f8f9fa',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            fontSize: '14px'
          }}>
            <strong>Summary:</strong>
            <div style={{ marginTop: '0.5rem' }}>
              {formData.roomNumber && formData.building && formData.floor !== '' ? (
                <>
                  Room <strong>{formData.roomNumber}</strong> in{' '}
                  <strong>{formData.building}</strong> on{' '}
                  <strong>{formData.floor === '0' ? 'Ground Floor' : `Floor ${formData.floor}`}</strong>
                  {formData.type && (
                    <>, configured as a <strong>{formData.type}</strong></>
                  )}
                  {formData.capacity && (
                    <> with capacity for <strong>{formData.capacity}</strong> people</>
                  )}
                </>
              ) : (
                <em style={{ color: '#666' }}>Fill in the form to see summary</em>
              )}
            </div>
          </div>

          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'flex-end'
          }}>
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
            >
              {room ? 'Update Room' : 'Create Room'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoomForm;
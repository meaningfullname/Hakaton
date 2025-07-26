import React from 'react';
import { Search, X } from 'lucide-react';
import Button from '../../ui/Button';

const RoomFilters = ({ 
  filters, 
  onFilterChange, 
  onClearFilters, 
  rooms,
  getFloorName 
}) => {
  const handleFilterChange = (filterType, value) => {
    onFilterChange({
      ...filters,
      [filterType]: value
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  // Get unique values for filter options
  const uniqueFloors = [...new Set(rooms.map(room => room.floor))].sort((a, b) => a - b);
  const uniqueBuildings = [...new Set(rooms.map(room => room.building))].sort();
  const uniqueTypes = [...new Set(rooms.map(room => room.type))].sort();

  return (
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
        <h3 style={{ margin: 0, color: '#333', fontSize: '1.1rem' }}>
          Filter Rooms
        </h3>
        {hasActiveFilters && (
          <Button
            variant="secondary"
            size="small"
            onClick={onClearFilters}
            icon={<X size={14} />}
          >
            Clear All
          </Button>
        )}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '1rem'
      }}>
        {/* Search */}
        <div>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            color: '#555',
            fontWeight: '500',
            fontSize: '14px'
          }}>
            Search
          </label>
          <div style={{ position: 'relative' }}>
            <Search 
              size={16} 
              style={{
                position: 'absolute',
                left: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#999'
              }}
            />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
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

        {/* Floor Filter */}
        <div>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            color: '#555',
            fontWeight: '500',
            fontSize: '14px'
          }}>
            Floor
          </label>
          <select
            value={filters.floor}
            onChange={(e) => handleFilterChange('floor', e.target.value)}
            style={{
              width: '100%',
              padding: '0.6rem',
              border: '1px solid #ddd',
              borderRadius: '5px',
              fontSize: '14px',
              background: 'white'
            }}
          >
            <option value="">All Floors</option>
            {uniqueFloors.map(floor => (
              <option key={floor} value={floor}>
                {getFloorName(floor)}
              </option>
            ))}
          </select>
        </div>

        {/* Building Filter */}
        <div>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            color: '#555',
            fontWeight: '500',
            fontSize: '14px'
          }}>
            Building
          </label>
          <select
            value={filters.building}
            onChange={(e) => handleFilterChange('building', e.target.value)}
            style={{
              width: '100%',
              padding: '0.6rem',
              border: '1px solid #ddd',
              borderRadius: '5px',
              fontSize: '14px',
              background: 'white'
            }}
          >
            <option value="">All Buildings</option>
            {uniqueBuildings.map(building => (
              <option key={building} value={building}>
                {building}
              </option>
            ))}
          </select>
        </div>

        {/* Type Filter */}
        <div>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            color: '#555',
            fontWeight: '500',
            fontSize: '14px'
          }}>
            Room Type
          </label>
          <select
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            style={{
              width: '100%',
              padding: '0.6rem',
              border: '1px solid #ddd',
              borderRadius: '5px',
              fontSize: '14px',
              background: 'white'
            }}
          >
            <option value="">All Types</option>
            {uniqueTypes.map(type => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            color: '#555',
            fontWeight: '500',
            fontSize: '14px'
          }}>
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            style={{
              width: '100%',
              padding: '0.6rem',
              border: '1px solid #ddd',
              borderRadius: '5px',
              fontSize: '14px',
              background: 'white'
            }}
          >
            <option value="">All Statuses</option>
            <option value="free">🟢 Available</option>
            <option value="occupied">🔴 Occupied</option>
            <option value="reserved">🟡 Reserved</option>
            <option value="maintenance">⚫ Maintenance</option>
          </select>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          paddingTop: '1rem',
          borderTop: '1px solid #eee'
        }}>
          <span style={{ 
            fontSize: '14px', 
            color: '#666',
            marginRight: '8px'
          }}>
            Active filters:
          </span>
          
          {filters.search && (
            <div style={{
              background: '#e3f2fd',
              color: '#1976d2',
              padding: '4px 8px',
              borderRadius: '12px',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              Search: "{filters.search}"
              <button
                onClick={() => handleFilterChange('search', '')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#1976d2',
                  cursor: 'pointer',
                  padding: '0',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <X size={12} />
              </button>
            </div>
          )}

          {filters.floor !== '' && (
            <div style={{
              background: '#f3e5f5',
              color: '#7b1fa2',
              padding: '4px 8px',
              borderRadius: '12px',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              Floor: {getFloorName(parseInt(filters.floor))}
              <button
                onClick={() => handleFilterChange('floor', '')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#7b1fa2',
                  cursor: 'pointer',
                  padding: '0',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <X size={12} />
              </button>
            </div>
          )}

          {filters.building && (
            <div style={{
              background: '#e8f5e8',
              color: '#2e7d32',
              padding: '4px 8px',
              borderRadius: '12px',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              Building: {filters.building}
              <button
                onClick={() => handleFilterChange('building', '')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#2e7d32',
                  cursor: 'pointer',
                  padding: '0',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <X size={12} />
              </button>
            </div>
          )}

          {filters.type && (
            <div style={{
              background: '#fff3e0',
              color: '#f57c00',
              padding: '4px 8px',
              borderRadius: '12px',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              Type: {filters.type}
              <button
                onClick={() => handleFilterChange('type', '')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#f57c00',
                  cursor: 'pointer',
                  padding: '0',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <X size={12} />
              </button>
            </div>
          )}

          {filters.status && (
            <div style={{
              background: '#fce4ec',
              color: '#c2185b',
              padding: '4px 8px',
              borderRadius: '12px',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              Status: {filters.status}
              <button
                onClick={() => handleFilterChange('status', '')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#c2185b',
                  cursor: 'pointer',
                  padding: '0',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <X size={12} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RoomFilters;
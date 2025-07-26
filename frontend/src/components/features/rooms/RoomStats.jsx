import React from 'react';
import { 
  Home, 
  Users, 
  Activity, 
  Wrench, 
  Calendar,
  Building,
  MapPin,
  BarChart3
} from 'lucide-react';

const RoomStats = ({ stats, getStatusColor }) => {
  const statusStats = [
    {
      label: 'Total Rooms',
      value: stats.total || 0,
      color: '#667eea',
      icon: <Home size={24} />
    },
    {
      label: 'Available',
      value: stats.free || 0,
      color: getStatusColor('free'),
      icon: <Activity size={24} />
    },
    {
      label: 'Occupied',
      value: stats.occupied || 0,
      color: getStatusColor('occupied'),
      icon: <Users size={24} />
    },
    {
      label: 'Reserved',
      value: stats.reserved || 0,
      color: getStatusColor('reserved'),
      icon: <Calendar size={24} />
    },
    {
      label: 'Maintenance',
      value: stats.maintenance || 0,
      color: getStatusColor('maintenance'),
      icon: <Wrench size={24} />
    }
  ];

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
        alignItems: 'center',
        gap: '8px',
        marginBottom: '1.5rem'
      }}>
        <BarChart3 size={24} style={{ color: '#667eea' }} />
        <h3 style={{ margin: 0, color: '#333', fontSize: '1.2rem' }}>
          Room Statistics
        </h3>
      </div>

      {/* Status Statistics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        {statusStats.map((stat, index) => (
          <div
            key={index}
            style={{
              background: '#f8f9fa',
              borderRadius: '8px',
              padding: '1.5rem',
              textAlign: 'center',
              borderLeft: `4px solid ${stat.color}`,
              transition: 'transform 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ 
              color: stat.color, 
              marginBottom: '0.5rem',
              display: 'flex',
              justifyContent: 'center'
            }}>
              {stat.icon}
            </div>
            <div style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: stat.color,
              marginBottom: '0.25rem'
            }}>
              {stat.value}
            </div>
            <div style={{
              fontSize: '0.9rem',
              color: '#666',
              fontWeight: '500'
            }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Distribution Charts */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2rem'
      }}>
        {/* By Floor */}
        {stats.byFloor && Object.keys(stats.byFloor).length > 0 && (
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '1rem'
            }}>
              <MapPin size={20} style={{ color: '#667eea' }} />
              <h4 style={{ margin: 0, color: '#333' }}>Distribution by Floor</h4>
            </div>
            <div style={{ 
              background: '#f8f9fa',
              borderRadius: '8px',
              padding: '1rem'
            }}>
              {Object.entries(stats.byFloor).map(([floor, count]) => (
                <div
                  key={floor}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.5rem 0',
                    borderBottom: '1px solid #eee'
                  }}
                >
                  <span style={{ fontWeight: '500' }}>{floor}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        background: '#667eea',
                        height: '8px',
                        borderRadius: '4px',
                        width: `${Math.max((count / stats.total) * 100, 10)}px`,
                        minWidth: '20px'
                      }}
                    />
                    <span style={{ 
                      fontSize: '14px',
                      fontWeight: 'bold',
                      minWidth: '30px',
                      textAlign: 'right'
                    }}>
                      {count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* By Building */}
        {stats.byBuilding && Object.keys(stats.byBuilding).length > 0 && (
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '1rem'
            }}>
              <Building size={20} style={{ color: '#667eea' }} />
              <h4 style={{ margin: 0, color: '#333' }}>Distribution by Building</h4>
            </div>
            <div style={{ 
              background: '#f8f9fa',
              borderRadius: '8px',
              padding: '1rem'
            }}>
              {Object.entries(stats.byBuilding).map(([building, count]) => (
                <div
                  key={building}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.5rem 0',
                    borderBottom: '1px solid #eee'
                  }}
                >
                  <span style={{ fontWeight: '500' }}>{building}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        background: '#28a745',
                        height: '8px',
                        borderRadius: '4px',
                        width: `${Math.max((count / stats.total) * 100, 10)}px`,
                        minWidth: '20px'
                      }}
                    />
                    <span style={{ 
                      fontSize: '14px',
                      fontWeight: 'bold',
                      minWidth: '30px',
                      textAlign: 'right'
                    }}>
                      {count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* By Type - Top 5 */}
        {stats.byType && Object.keys(stats.byType).length > 0 && (
          <div style={{ gridColumn: stats.byBuilding ? 'auto' : 'span 2' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '1rem'
            }}>
              <Home size={20} style={{ color: '#667eea' }} />
              <h4 style={{ margin: 0, color: '#333' }}>Top Room Types</h4>
            </div>
            <div style={{ 
              background: '#f8f9fa',
              borderRadius: '8px',
              padding: '1rem'
            }}>
              {Object.entries(stats.byType)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([type, count]) => (
                <div
                  key={type}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.5rem 0',
                    borderBottom: '1px solid #eee'
                  }}
                >
                  <span style={{ 
                    fontWeight: '500',
                    fontSize: '14px',
                    maxWidth: '200px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {type}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        background: '#fd7e14',
                        height: '8px',
                        borderRadius: '4px',
                        width: `${Math.max((count / stats.total) * 150, 15)}px`,
                        minWidth: '20px'
                      }}
                    />
                    <span style={{ 
                      fontSize: '14px',
                      fontWeight: 'bold',
                      minWidth: '30px',
                      textAlign: 'right'
                    }}>
                      {count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Utilization Summary */}
      <div style={{
        marginTop: '2rem',
        padding: '1rem',
        background: '#e3f2fd',
        borderRadius: '8px',
        borderLeft: '4px solid #1976d2'
      }}>
        <h4 style={{ margin: '0 0 0.5rem 0', color: '#1976d2' }}>
          Quick Overview
        </h4>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          fontSize: '14px'
        }}>
          <div>
            <strong>Utilization Rate:</strong>{' '}
            {stats.total > 0 
              ? `${Math.round(((stats.occupied + stats.reserved) / stats.total) * 100)}%`
              : '0%'
            }
          </div>
          <div>
            <strong>Available Now:</strong>{' '}
            {((stats.free / stats.total) * 100).toFixed(1)}% ({stats.free} rooms)
          </div>
          <div>
            <strong>Most Common Type:</strong>{' '}
            {stats.byType && Object.keys(stats.byType).length > 0
              ? Object.entries(stats.byType).sort(([,a], [,b]) => b - a)[0][0]
              : 'N/A'
            }
          </div>
          <div>
            <strong>Maintenance Required:</strong>{' '}
            {stats.maintenance} room{stats.maintenance !== 1 ? 's' : ''}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomStats;
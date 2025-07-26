import React from 'react';
import { Filter, X } from 'lucide-react';
import Button from '../../ui/Button';

const TodoFilters = ({ filters, onFilterChange, onClearFilters, stats }) => {
  const handleFilterChange = (filterType, value) => {
    onFilterChange({
      ...filters,
      [filterType]: value
    });
  };

  const hasActiveFilters = filters.status || filters.type || filters.priority;

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
        marginBottom: '1rem'
      }}>
        <Filter size={20} style={{ color: '#667eea' }} />
        <h3 style={{ margin: 0, color: '#333' }}>Filters</h3>
        {hasActiveFilters && (
          <Button
            variant="secondary"
            size="small"
            onClick={onClearFilters}
            icon={<X size={14} />}
            style={{ marginLeft: 'auto' }}
          >
            Clear All
          </Button>
        )}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        alignItems: 'end'
      }}>
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
            <option value="todo">Todo ({stats.todo || 0})</option>
            <option value="doing">Doing ({stats.doing || 0})</option>
            <option value="done">Done ({stats.done || 0})</option>
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
            Type
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
            <option value="personal">Personal ({stats.personal || 0})</option>
            <option value="assigned">Assigned ({stats.assigned || 0})</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            color: '#555',
            fontWeight: '500',
            fontSize: '14px'
          }}>
            Priority
          </label>
          <select
            value={filters.priority}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
            style={{
              width: '100%',
              padding: '0.6rem',
              border: '1px solid #ddd',
              borderRadius: '5px',
              fontSize: '14px',
              background: 'white'
            }}
          >
            <option value="">All Priorities</option>
            <option value="urgent">🔴 Urgent</option>
            <option value="high">🟠 High</option>
            <option value="medium">🟡 Medium</option>
            <option value="low">🟢 Low</option>
          </select>
        </div>
      </div>

      {/* Quick Stats */}
      <div style={{
        marginTop: '1rem',
        padding: '1rem',
        background: '#f8f9fa',
        borderRadius: '8px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
        gap: '1rem',
        fontSize: '14px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 'bold', color: '#667eea', fontSize: '18px' }}>
            {stats.total || 0}
          </div>
          <div style={{ color: '#666' }}>Total</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 'bold', color: '#dc3545', fontSize: '18px' }}>
            {stats.overdue || 0}
          </div>
          <div style={{ color: '#666' }}>Overdue</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 'bold', color: '#fd7e14', fontSize: '18px' }}>
            {stats.urgent || 0}
          </div>
          <div style={{ color: '#666' }}>Urgent</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 'bold', color: '#28a745', fontSize: '18px' }}>
            {stats.done || 0}
          </div>
          <div style={{ color: '#666' }}>Completed</div>
        </div>
      </div>
    </div>
  );
};

export default TodoFilters;
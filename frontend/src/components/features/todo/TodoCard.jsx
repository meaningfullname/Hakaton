import React, { useState } from 'react';
import { Clock, User, AlertTriangle, Edit, Trash2, Play, Pause, CheckCircle, RotateCcw } from 'lucide-react';
import { formatDateTime, isOverdue } from '../../../utils/formatters';
import Button from '../../ui/Button';

const TodoCard = ({ todo, onStatusUpdate, onDelete, onEdit }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isTaskOverdue = todo.deadline && isOverdue(todo.deadline) && todo.status !== 'done';
  
  const getPriorityColor = () => {
    switch (todo.priority) {
      case 'urgent': return '#dc3545';
      case 'high': return '#fd7e14';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  const getStatusColor = () => {
    if (isTaskOverdue) return '#dc3545';
    switch (todo.status) {
      case 'done': return '#28a745';
      case 'doing': return '#17a2b8';
      case 'todo': return '#667eea';
      default: return '#6c757d';
    }
  };

  const getBackgroundColor = () => {
    if (isTaskOverdue) return '#fff5f5';
    switch (todo.status) {
      case 'done': return '#f0fff4';
      case 'doing': return '#f0f9ff';
      default: return 'white';
    }
  };

  const getStatusIcon = () => {
    switch (todo.status) {
      case 'todo': return <Play size={16} />;
      case 'doing': return <Pause size={16} />;
      case 'done': return <CheckCircle size={16} />;
      default: return null;
    }
  };

  const handleStatusChange = (newStatus) => {
    onStatusUpdate(todo._id, newStatus);
  };

  const renderActionButtons = () => {
    const buttonStyle = {
      padding: '4px 8px',
      fontSize: '12px'
    };

    if (todo.status === 'todo') {
      return (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Button
            variant="info"
            size="small"
            onClick={() => handleStatusChange('doing')}
            icon={<Play size={14} />}
            style={buttonStyle}
          >
            Start
          </Button>
          {todo.type === 'personal' && (
            <>
              <Button
                variant="warning"
                size="small"
                onClick={() => onEdit(todo)}
                icon={<Edit size={14} />}
                style={buttonStyle}
              >
                Edit
              </Button>
              <Button
                variant="danger"
                size="small"
                onClick={() => onDelete(todo._id)}
                icon={<Trash2 size={14} />}
                style={buttonStyle}
              >
                Delete
              </Button>
            </>
          )}
        </div>
      );
    } else if (todo.status === 'doing') {
      return (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Button
            variant="success"
            size="small"
            onClick={() => handleStatusChange('done')}
            icon={<CheckCircle size={14} />}
            style={buttonStyle}
          >
            Complete
          </Button>
          <Button
            variant="secondary"
            size="small"
            onClick={() => handleStatusChange('todo')}
            icon={<RotateCcw size={14} />}
            style={buttonStyle}
          >
            Back to Todo
          </Button>
          {todo.type === 'personal' && (
            <Button
              variant="danger"
              size="small"
              onClick={() => onDelete(todo._id)}
              icon={<Trash2 size={14} />}
              style={buttonStyle}
            >
              Delete
            </Button>
          )}
        </div>
      );
    } else if (todo.status === 'done') {
      return (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Button
            variant="secondary"
            size="small"
            onClick={() => handleStatusChange('todo')}
            icon={<RotateCcw size={14} />}
            style={buttonStyle}
          >
            Reopen
          </Button>
          {todo.type === 'personal' && (
            <Button
              variant="danger"
              size="small"
              onClick={() => onDelete(todo._id)}
              icon={<Trash2 size={14} />}
              style={buttonStyle}
            >
              Delete
            </Button>
          )}
        </div>
      );
    }
  };

  return (
    <div style={{
      background: getBackgroundColor(),
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      borderLeft: `4px solid ${getStatusColor()}`,
      transition: 'all 0.2s ease'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{
            margin: '0 0 8px 0',
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#333',
            cursor: 'pointer'
          }}
          onClick={() => setIsExpanded(!isExpanded)}
          >
            {todo.title}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '12px',
              color: getStatusColor(),
              fontWeight: 'bold'
            }}>
              {getStatusIcon()}
              {todo.status.toUpperCase()}
            </div>
            <div style={{
              background: getPriorityColor(),
              color: 'white',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '10px',
              fontWeight: 'bold',
              textTransform: 'uppercase'
            }}>
              {todo.priority}
            </div>
            <div style={{
              background: todo.type === 'assigned' ? '#17a2b8' : '#28a745',
              color: 'white',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '10px',
              fontWeight: 'bold',
              textTransform: 'uppercase'
            }}>
              {todo.type}
            </div>
            {todo.isRequired && (
              <div style={{
                background: '#dc3545',
                color: 'white',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '10px',
                fontWeight: 'bold'
              }}>
                REQUIRED
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      {todo.description && (
        <div style={{
          fontSize: '14px',
          color: '#666',
          marginBottom: '12px',
          lineHeight: '1.4',
          maxHeight: isExpanded ? 'none' : '40px',
          overflow: 'hidden'
        }}>
          {todo.description}
        </div>
      )}

      {/* Metadata */}
      <div style={{ fontSize: '12px', color: '#888', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
          <Clock size={12} />
          Created: {formatDateTime(todo.createdAt)}
        </div>
        
        {todo.deadline && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            marginBottom: '4px',
            color: isTaskOverdue ? '#dc3545' : '#888',
            fontWeight: isTaskOverdue ? 'bold' : 'normal'
          }}>
            {isTaskOverdue && <AlertTriangle size={12} />}
            <Clock size={12} />
            Deadline: {formatDateTime(todo.deadline)}
          </div>
        )}

        {todo.createdBy && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
            <User size={12} />
            Created by: {todo.createdBy.firstName} {todo.createdBy.lastName}
          </div>
        )}

        {todo.completedAt && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#28a745' }}>
            <CheckCircle size={12} />
            Completed: {formatDateTime(todo.completedAt)}
          </div>
        )}
      </div>

      {/* Admin Notes */}
      {todo.adminNotes && isExpanded && (
        <div style={{
          background: '#f8f9fa',
          padding: '8px',
          borderRadius: '4px',
          marginBottom: '12px',
          fontSize: '12px',
          borderLeft: '3px solid #17a2b8'
        }}>
          <strong>Admin Notes:</strong> {todo.adminNotes}
        </div>
      )}

      {/* Actions */}
      {renderActionButtons()}

      {/* Expand/Collapse button */}
      {(todo.description || todo.adminNotes) && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            background: 'none',
            border: 'none',
            color: '#667eea',
            fontSize: '12px',
            cursor: 'pointer',
            marginTop: '8px',
            textTransform: 'uppercase',
            fontWeight: 'bold'
          }}
        >
          {isExpanded ? 'Show Less' : 'Show More'}
        </button>
      )}
    </div>
  );
};

export default TodoCard;
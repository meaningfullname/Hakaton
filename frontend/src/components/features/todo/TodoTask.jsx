import React from 'react';
import { formatDateTime, isOverdue } from '../../../utils/formatters';

const TodoTask = ({ task, onMove, onDelete }) => {
  const isTaskOverdue = task.deadline && isOverdue(task.deadline) && task.status !== 'done';
  
  const getStatusColor = () => {
    if (isTaskOverdue) return '#dc3545';
    if (task.status === 'done') return '#28a745';
    if (task.status === 'doing') return '#17a2b8';
    return '#667eea';
  };

  const getBackgroundColor = () => {
    if (isTaskOverdue) return '#fff5f5';
    if (task.status === 'done') return '#f0fff4';
    if (task.status === 'doing') return '#f0f9ff';
    return 'white';
  };

  const renderButtons = () => {
    const buttonStyle = {
      padding: '5px 12px',
      fontSize: '12px',
      borderRadius: '4px',
      border: 'none',
      cursor: 'pointer',
      marginRight: '8px'
    };

    if (task.status === 'todo') {
      return (
        <>
          <button
            onClick={() => onMove(task.id, 'doing')}
            style={{ ...buttonStyle, background: '#17a2b8', color: 'white' }}
          >
            Start
          </button>
          <button
            onClick={() => onDelete(task.id)}
            style={{ ...buttonStyle, background: '#dc3545', color: 'white' }}
          >
            Delete
          </button>
        </>
      );
    } else if (task.status === 'doing') {
      return (
        <>
          <button
            onClick={() => onMove(task.id, 'done')}
            style={{ ...buttonStyle, background: '#28a745', color: 'white' }}
          >
            Complete
          </button>
          <button
            onClick={() => onMove(task.id, 'todo')}
            style={{ ...buttonStyle, background: '#6c757d', color: 'white' }}
          >
            Back to Todo
          </button>
          <button
            onClick={() => onDelete(task.id)}
            style={{ ...buttonStyle, background: '#dc3545', color: 'white' }}
          >
            Delete
          </button>
        </>
      );
    } else if (task.status === 'done') {
      return (
        <>
          <button
            onClick={() => onMove(task.id, 'todo')}
            style={{ ...buttonStyle, background: '#6c757d', color: 'white' }}
          >
            Reopen
          </button>
          <button
            onClick={() => onDelete(task.id)}
            style={{ ...buttonStyle, background: '#dc3545', color: 'white' }}
          >
            Delete
          </button>
        </>
      );
    }
  };

  return (
    <div style={{
      background: getBackgroundColor(),
      margin: '15px 0',
      padding: '15px',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      borderLeft: `4px solid ${getStatusColor()}`
    }}>
      <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '10px', color: '#333' }}>
        {task.text}
      </div>
      <div style={{ fontSize: '12px', color: '#666', marginBottom: '15px' }}>
        <div style={{ margin: '3px 0' }}>Created: {formatDateTime(task.createdAt)}</div>
        {task.deadline && (
          <div style={{ 
            margin: '3px 0', 
            fontWeight: 'bold', 
            color: isTaskOverdue ? '#dc3545' : '#666' 
          }}>
            Deadline: {formatDateTime(task.deadline)}
          </div>
        )}
        {task.completedAt && (
          <div style={{ margin: '3px 0' }}>
            Completed: {formatDateTime(task.completedAt)}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {renderButtons()}
      </div>
    </div>
  );
};

export default TodoTask;
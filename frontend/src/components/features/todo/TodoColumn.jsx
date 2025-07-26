import React from 'react';
import TodoTask from './TodoTask';

const TodoColumn = ({ title, tasks, bgColor, onMove, onDelete }) => (
  <div style={{
    background: '#f8f9fa',
    borderRadius: '10px',
    padding: '20px',
    minHeight: '400px',
    minWidth: '300px',
    flex: 1,
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
  }}>
    <h2 style={{
      textAlign: 'center',
      marginBottom: '20px',
      padding: '10px',
      borderRadius: '5px',
      color: 'white',
      fontSize: '1.2em',
      background: bgColor
    }}>
      {title}
    </h2>
    <div>
      {tasks.map(task => (
        <TodoTask
          key={task.id}
          task={task}
          onMove={onMove}
          onDelete={onDelete}
        />
      ))}
    </div>
  </div>
);

export default TodoColumn;
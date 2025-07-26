import React, { useState } from 'react';
import { isOverdue } from '../utils/formatters';
import TodoColumn from '../components/features/todo/TodoColumn';
import Button from '../components/ui/Button';

const TodoListPage = () => {
  const [tasks, setTasks] = useState([
    { 
      id: 1, 
      text: 'Sample Task - Try moving it around!', 
      deadline: '', 
      createdAt: new Date(), 
      status: 'todo' 
    }
  ]);
  const [taskInput, setTaskInput] = useState('');
  const [deadlineInput, setDeadlineInput] = useState('');
  const [taskIdCounter, setTaskIdCounter] = useState(2);

  const addTask = () => {
    if (!taskInput.trim()) {
      alert('Please enter a task!');
      return;
    }

    const newTask = {
      id: taskIdCounter,
      text: taskInput,
      deadline: deadlineInput,
      createdAt: new Date(),
      status: 'todo'
    };

    setTasks([...tasks, newTask]);
    setTaskInput('');
    setDeadlineInput('');
    setTaskIdCounter(taskIdCounter + 1);
  };

  const moveTask = (taskId, newStatus) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, status: newStatus, ...(newStatus === 'done' ? { completedAt: new Date() } : {}) }
        : task
    ));
  };

  const deleteTask = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const getTasksByStatus = (status) => {
    if (status === 'outdated') {
      return tasks.filter(task => task.deadline && isOverdue(task.deadline) && task.status !== 'done');
    }
    return tasks.filter(task => task.status === status);
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', color: 'white', marginBottom: '30px', fontSize: '2.5em' }}>
        Task Board
      </h1>
      
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '10px',
        marginBottom: '30px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="text"
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
            placeholder="Enter a new task..."
            style={{
              flex: 2,
              minWidth: '200px',
              padding: '10px',
              border: '2px solid #ddd',
              borderRadius: '5px',
              fontSize: '16px'
            }}
            onKeyPress={(e) => e.key === 'Enter' && addTask()}
          />
          <input
            type="datetime-local"
            value={deadlineInput}
            onChange={(e) => setDeadlineInput(e.target.value)}
            style={{
              flex: 1,
              minWidth: '150px',
              padding: '10px',
              border: '2px solid #ddd',
              borderRadius: '5px',
              fontSize: '16px'
            }}
          />
          <Button onClick={addTask}>Add Task</Button>
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '20px', overflowX: 'auto' }}>
        <TodoColumn
          title="To Do"
          tasks={getTasksByStatus('todo')}
          bgColor="#6c757d"
          onMove={moveTask}
          onDelete={deleteTask}
        />
        <TodoColumn
          title="Doing"
          tasks={getTasksByStatus('doing')}
          bgColor="#17a2b8"
          onMove={moveTask}
          onDelete={deleteTask}
        />
        <TodoColumn
          title="Done"
          tasks={getTasksByStatus('done')}
          bgColor="#28a745"
          onMove={moveTask}
          onDelete={deleteTask}
        />
        <TodoColumn
          title="Outdated"
          tasks={getTasksByStatus('outdated')}
          bgColor="#dc3545"
          onMove={moveTask}
          onDelete={deleteTask}
        />
      </div>
    </div>
  );
};

export default TodoListPage;
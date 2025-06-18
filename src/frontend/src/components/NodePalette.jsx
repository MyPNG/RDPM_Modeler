import React from 'react';

const NodePalette = () => {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside
      style={{
        padding: '10px',
        width: '200px',
        background: '#f4f4f4',
        borderRight: '1px solid #ddd',
      }}
    >
      <h3>Palette</h3>
      <div
        style={{
          padding: '8px',
          margin: '4px',
          background: '#fff',
          border: '1px solid #ddd',
          cursor: 'grab',
        }}
        draggable
        onDragStart={(event) => onDragStart(event, 'role')}
      >
        Role
      </div>
      <div
        style={{
          padding: '8px',
          margin: '4px',
          background: '#fff',
          border: '1px solid #ddd',
          cursor: 'grab',
        }}
        draggable
        onDragStart={(event) => onDragStart(event, 'task')}
      >
        Task
      </div>
      <div
        style={{
          padding: '8px',
          margin: '4px',
          background: '#fff',
          border: '1px solid #ddd',
          cursor: 'grab',
        }}
        draggable
        onDragStart={(event) => onDragStart(event, 'resource')}
      >
        Resource
      </div>
    </aside>
  );
};

export default NodePalette;
import React, { memo } from 'react';
import { Handle, Position, NodeToolbar } from 'reactflow';

const CustomNode = ({ data }) => {
  return (
    <>
      <NodeToolbar isVisible={true} position={data.toolbarPosition}>
        <button>delete</button>
        <button>edit</button>
        <button>expand</button>
      </NodeToolbar>

      <div style={{ padding: '10px 20px' }}>
        {data.label}
      </div>

      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </>
  );
};

export default memo(CustomNode);
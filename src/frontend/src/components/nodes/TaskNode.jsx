import React from "react";
import { Handle, Position } from "reactflow";
import "./nodes.css"; // Ensure styles are applied

const TaskNode = ({ data }) => {
  return (
    <div className={`task-node expand`}>
      <div className="rectangle">{data.label}</div>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default TaskNode;
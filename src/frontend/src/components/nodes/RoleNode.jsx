import React from "react";
import "./nodes.css"; 
import { Handle, Position } from "reactflow";

const RoleNode = ({ data }) => {
  return (
    <div className="role-node" onClick={data.onClick}>
      <div className="circle">{data.label}</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default RoleNode;

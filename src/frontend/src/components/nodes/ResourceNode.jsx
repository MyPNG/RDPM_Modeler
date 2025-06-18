import React from "react";
import { Handle, Position } from "reactflow";

const ResourceNode = ({ data }) => {
    return (
      <div className={`resource-node expand`}>
        <div className="rectangle">{data.label}</div>
        <Handle type="target" position={Position.Top} />
      </div>
    );
  };
  
  export default ResourceNode;
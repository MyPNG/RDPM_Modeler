import React from "react";
import { Handle, Position } from "reactflow";
import ReactBpmnViewer from "../ReactBpmnViewer";

const ChangePatternNode = ({ data }) => {
    return (
      <div className={`change-pattern-node expand`}>
        <ReactBpmnViewer diagramXML={data.diagramXML} height="15vh" />
        <Handle type="target" position={Position.Top} />
      </div>
    );
  };
  
  export default ChangePatternNode;
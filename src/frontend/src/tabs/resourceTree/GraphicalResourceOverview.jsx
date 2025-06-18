import React from "react";
import Nodes from "./Nodes";


const heightChangePattern = "10vh";
const GraphicalResourceOverview = ({
  resources,
  onEditResource,
  onDeleteResource,
  focus,
  tree,
  expandedRoles,
  expandedTasks,
  expandedResources,
  expandedRp,
  toggleRole,
  toggleTask,
  toggleResource,
}) => {
  return (
    <div>
      <Nodes
        resources={resources}
        height={heightChangePattern}
        onEditResource={onEditResource}
        onDeleteResource={onDeleteResource}
        focus={focus}
        tree={tree}
        expandedRoles={expandedRoles}
        expandedTasks={expandedTasks}
        expandedResources={expandedResources}
        expandedRp={expandedRp}
        toggleRole={toggleRole}
        toggleTask={toggleTask}
        toggleResource={toggleResource}
      ></Nodes>
    </div>
  );
};

export default GraphicalResourceOverview;

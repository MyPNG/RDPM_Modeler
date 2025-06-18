import React, { useMemo } from "react";
import ReactFlow, { Background, Handle, MiniMap, Controls } from "reactflow";
import "reactflow/dist/style.css";

const RoleNode = ({ data }) => {
  return (
    <div
      style={{
        padding: 8,
        border: "1px solid #1976d2",
        borderRadius: 8,
        background: "#fff",
        textAlign: "center",
        fontSize: 12,
        width: 100,
      }}
    >
      <Handle type="target" position="top" style={{ opacity: 0 }} />
      {data.label}
      <Handle type="source" position="bottom" style={{ opacity: 0 }} />
    </div>
  );
};

const nodeTypes = { roleNode: RoleNode };

export default function RolesHierarchies({ roles }) {
  const { nodes, edges } = useMemo(() => {
    const roleMap = {};
    roles.forEach(({ _id, role, children, tasks }) => {
      roleMap[role] = { 
        id: _id,
        children: Array.isArray(children)
          ? children
          : (children || "")
              .split(",")
              .map((c) => c.trim())
              .filter(Boolean),
        ownTasks: Array.isArray(tasks)
          ? tasks
          : (tasks || "")
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean),
      };
    });

    console.log("roleMap", roleMap);
    // find all the children
    const allChildren = new Set();
    const allRoles = new Set(Object.keys(roleMap));
    console.log("all roles:", allRoles);
    Object.values(roleMap).forEach(({ children }) =>
      children.forEach((c) => allChildren.add(c))
    );
    console.log("all children:", allChildren);

    //  roots = roles that never appear as anyone's child
    const roots = [...allRoles].filter((r) => !allChildren.has(r));

    console.log("roots:", roots);

    if (roots.length === 0) {
      roots.push(...allRoles);
    }

    const depth = {};
    const q = [];
    roots.forEach((r) => {
      depth[r] = 0; // every root is at level 0
      q.push(r); // queue each root
    });
    while (q.length > 0) {
      const parent = q.shift(); // dequeue node
      const d = depth[parent]; // the depth of that node
      (roleMap[parent]?.children || []).forEach((child) => {
        // for each child of that node
        if (depth[child] == null) {
          depth[child] = d + 1;
          q.push(child); // enqueue the child so we can visit it later
        }
      });
    }

    const byDepth = {};
    Object.keys(depth).forEach((r) => {
      byDepth[depth[r]] = byDepth[depth[r]] || [];
      byDepth[depth[r]].push(r);
    });

    console.log("byDepth:", byDepth);

    const gapX = 180;
    const gapY = 120;
    const nodes = [];
    Object.entries(byDepth).forEach(([dStr, roleList]) => {
      const d = parseInt(dStr, 10);
      console.log("d:", d);
      roleList.forEach((roleName, idx) => {
        console.log("role being pushed:", roleName);
        nodes.push({
          id: roleName,
          type: "roleNode",
          data: { label: roleName },
          position: {
            x: idx * gapX + 50,
            y: d * gapY + 50,
          },
        });
      });
    });

    const edges = [];
    console.log("roleMap", roleMap);
    Object.entries(roleMap).forEach(([parent, { children }]) => {
      children.forEach((child) => {
        edges.push({
          id: `e-${parent}-${child}`,
          source: parent,
          target: child,
          animated: true,
          markerEnd: {
            type: "arrowclosed",
            color: "",
          },
        });
      });
    });

    return { nodes, edges };
  }, [roles]);

  return (
    <div style={{ width: "100%", height: "600px" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
      >
        <MiniMap />
        <Controls />
        <Background gap={16} />
      </ReactFlow>
    </div>
  );
}

import React, { useMemo } from "react";
import RolesHierarchies from "./RolesHierarchies";
import RoleBasedAccessControl from "./RoleBasedAccessControl";

const RolesHierArchiesOverview = ({
  roles,
  onEdit,
  onDelete
}) => {

  return (
    <>
      <RolesHierarchies
        roles={roles}
      ></RolesHierarchies>
      <RoleBasedAccessControl
        roleData={roles}
        onEdit={onEdit}
        onDelete={onDelete}
      ></RoleBasedAccessControl>
    </>
  );
};

export default RolesHierArchiesOverview;

import config from '../../../../config.json';
const NODE_SERVER_PORT = config.NODE_SERVER_PORT;

export const deleteRole = async (roleId) => {
  try {
    const response = await fetch(
      `http://localhost:${NODE_SERVER_PORT}/api/roles/${roleId}`,
      { method: "DELETE" }
    );
    if (!response.ok) {
      throw new Error("Failed to delete role");
    }
    return true;
  } catch (error) {
    console.error("Error deleting role:", error);
    return false;
  }
};

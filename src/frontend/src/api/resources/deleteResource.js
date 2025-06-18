import config from '../../../../config.json';
const NODE_SERVER_PORT = config.NODE_SERVER_PORT;

export const deleteResource = async (resourceId) => {
  try {
    const response = await fetch(
      `http://localhost:${NODE_SERVER_PORT}/api/resources/${resourceId}`,
      { method: "DELETE" }
    );
    if (!response.ok) {
      throw new Error("Failed to delete resource");
    }
    return true;
  } catch (error) {
    console.error("Error deleting resource:", error);
    return false;
  }
};

import config from '../../../../config.json';
const NODE_SERVER_PORT = config.NODE_SERVER_PORT;

export async function getRoles() {
    const response = await fetch(`http://localhost:${NODE_SERVER_PORT}/api/roles`);
    if (!response.ok) {
      throw new Error("Failed to fetch roles");
    }
    const data = await response.json();
    return data;
  }
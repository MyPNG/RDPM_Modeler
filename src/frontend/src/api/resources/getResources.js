import config from '../../../../config.json';
const NODE_SERVER_PORT = config.NODE_SERVER_PORT;

export async function getResources() {
    const response = await fetch(`http://localhost:${NODE_SERVER_PORT}/api/resources`);
    if (!response.ok) {
      throw new Error("Failed to fetch resources");
    }
    const data = await response.json();
    return data;
  }
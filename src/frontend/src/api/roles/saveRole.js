import config from '../../../../config.json';
const NODE_SERVER_PORT = config.NODE_SERVER_PORT;

export async function saveRole(roleData) {
    const response = await fetch(`http://localhost:${NODE_SERVER_PORT}/api/roles`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(roleData),
    });
  
    if (!response.ok) {
      throw new Error("Failed to save role");
    }
  
    return await response.json();
  }
  
import config from '../../../../config.json';
const NODE_SERVER_PORT = config.NODE_SERVER_PORT;

export async function updateProfile({ resource, task, duration }) {
    const response = await fetch(`http://localhost:${NODE_SERVER_PORT}/api/performanceProfiles/update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ resource, task, duration }),
    });
  
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`UpdateProfile fehlgeschlagen: ${response.status} ${text}`);
    }
  
    return await response.json();
  }
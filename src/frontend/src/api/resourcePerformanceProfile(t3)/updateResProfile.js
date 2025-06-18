import config from '../../../../config.json';
const NODE_SERVER_PORT = config.NODE_SERVER_PORT;


export async function updateResProfile({ resource, count, duration, minDuration, maxDuration }) {
    const response = await fetch(`http://localhost:${NODE_SERVER_PORT}/api/resourcePerformanceProfile/update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ resource, count, duration, minDuration, maxDuration }),
    });
  
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`UpdateProfile fehlgeschlagen: ${response.status} ${text}`);
    }
  
    return await response.json();
  }
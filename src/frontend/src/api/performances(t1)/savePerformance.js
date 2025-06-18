import config from '../../../../config.json';
const NODE_SERVER_PORT = config.NODE_SERVER_PORT;

export async function savePerformance(performanceData) {
    const response = await fetch(`http://localhost:${NODE_SERVER_PORT}/api/performances`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(performanceData),
    });
  
    if (!response.ok) {
      throw new Error("Failed to save performance data");
    }
  
    return await response.json();
  }
  
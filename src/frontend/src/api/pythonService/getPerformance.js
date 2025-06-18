import config from '../../../../config.json';
const PY_SERVER_PORT = config.PY_SERVER_PORT;

export async function getPerformanceData(performanceData) {
    const response = await fetch(`http://localhost:${PY_SERVER_PORT}/performanceData`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(performanceData),
    });
  
    if (!response.ok) {
      throw new Error("Failed to get performance data");
    } 
    return await response.json();
  }
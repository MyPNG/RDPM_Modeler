import config from '../../../../config.json';
const NODE_SERVER_PORT = config.NODE_SERVER_PORT;

export async function getResPerformancePr() {
    const response = await fetch(`http://localhost:${NODE_SERVER_PORT}/api/resourcePerformanceProfile`);
    if (!response.ok) {
      throw new Error("Failed to fetch Performance profile data");
    }
    const data = await response.json();
    return data;
  }
import config from '../../../../config.json';
const NODE_SERVER_PORT = config.NODE_SERVER_PORT;

export async function deleteAllPerformancePr() {
  const response = await fetch(
    `http://localhost:${NODE_SERVER_PORT}/api/performanceProfiles`,
    {
      method: "DELETE",
    }
  );
  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Failed to delete all performance profile data: ${response.status} ${text}`
    );
  }
  return await response.json();
}

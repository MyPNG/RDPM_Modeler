import config from '../../../../config.json';
const NODE_SERVER_PORT = config.NODE_SERVER_PORT;

export async function saveResource(resourceData) {
  const response = await fetch(`http://localhost:${NODE_SERVER_PORT}/api/resources`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(resourceData),
  });

  if (!response.ok) {
    throw new Error("Failed to save resource");
  }

  return await response.json();
}

import config from '../../../../config.json';
const NODE_SERVER_PORT = config.NODE_SERVER_PORT;

export async function updateResource(resourceId, resourceData) {
  console.log("resourceData to be updated:",resourceData);
  console.log("Payload to be saved:", JSON.stringify(resourceData, null, 2));
  const response = await fetch(
    `http://localhost:${NODE_SERVER_PORT}/api/resources/${resourceId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(resourceData),
    }
  );
  if (!response.ok) {
    throw new Error("Failed to update resource");
  }
  const data = await response.json();
  return data;
}

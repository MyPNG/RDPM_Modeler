import config from '../../../../config.json';
const NODE_SERVER_PORT = config.NODE_SERVER_PORT;

export async function updateRole(roleId, roleData) {
  console.log("roleData to be updated:", roleData);
  console.log("Payload to be saved:", JSON.stringify(roleData, null, 2));
  const response = await fetch(
    `http://localhost:${NODE_SERVER_PORT}/api/roles/${roleId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(roleData),
    }
  );
  if (!response.ok) {
    throw new Error("Failed to update role");
  }
  const data = await response.json();
  return data;
}

export async function getHAStates() {
  const url = process.env.HOME_ASSISTANT_URL;
  const token = process.env.HOME_ASSISTANT_TOKEN;

  if (!url || !token) {
    console.log("HA CONFIG MISSING");
    return [];
  }

  try {
    const response = await fetch(
      `${url}/api/states`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      console.log("HA RESPONSE ERROR:", response.status);
      return [];
    }

    return await response.json();
  } catch (err) {
    console.log("HA FETCH ERROR:", err);
    return [];
  }
}
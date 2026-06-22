export async function getHAStates({ force = false }: { force?: boolean } = {}) {
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
        ...(force
          ? { cache: "no-store" as const }
          : {
              cache: "force-cache" as const,
              next: { revalidate: 5 * 60 },
            }),
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

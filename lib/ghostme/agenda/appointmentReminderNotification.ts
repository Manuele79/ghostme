export async function sendAppointmentReminderNotification(
  userId: string,
  event: any
) {
  if (!userId || !event?.id) {
    return { sent: false, reason: "missing_data" };
  }

  const haUrl = process.env.HOME_ASSISTANT_URL;
  const haToken = process.env.HOME_ASSISTANT_TOKEN;
  const notifyService =
    process.env.HOME_ASSISTANT_NOTIFY_SERVICE || "notify.notify";

  if (!haUrl || !haToken) {
    return { sent: false, reason: "home_assistant_not_configured" };
  }

  try {
    const [domain, service] = notifyService.split(".");

    if (!domain || !service) {
      return { sent: false, reason: "invalid_notify_service" };
    }

    const res = await fetch(
      `${haUrl.replace(/\/$/, "")}/api/services/${domain}/${service}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${haToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "Promemoria GhostMe",
          message: `${event.title || "Appuntamento"} tra circa 30 minuti.`,
        }),
      }
    );

    if (!res.ok) {
      return { sent: false, reason: `home_assistant_${res.status}` };
    }

    return { sent: true, reason: "sent" };
  } catch (err) {
    console.log("APPOINTMENT REMINDER NOTIFICATION ERROR:", err);
    return { sent: false, reason: "notification_error" };
  }
}

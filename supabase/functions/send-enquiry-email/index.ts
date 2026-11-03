const allowedOrigins = new Set([
  "https://www.rizqone.com",
  "https://rizqone.com",
  "http://localhost:5500",
  "http://127.0.0.1:5500",
]);

const escapeHtml = (value: string): string =>
  value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const jsonResponse = (body: Record<string, string>, status: number, origin: string): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Content-Type": "application/json",
      "Vary": "Origin",
    },
  });

Deno.serve(async (request: Request) => {
  const origin = request.headers.get("Origin") ?? "";
  if (!allowedOrigins.has(origin)) {
    return new Response("Forbidden", { status: 403 });
  }

  if (request.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Vary": "Origin",
      },
    });
  }

  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405, origin);
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ error: "The enquiry payload must be valid JSON." }, 400, origin);
  }

  if (!isRecord(payload)) {
    return jsonResponse({ error: "The enquiry payload must be a JSON object." }, 400, origin);
  }

  const name = typeof payload.name === "string" ? payload.name.trim() : "";
  const email = typeof payload.email === "string" ? payload.email.trim() : "";
  const phone = typeof payload.phone === "string" ? payload.phone.trim() : "";
  const audience = typeof payload.audience === "string" ? payload.audience : "";
  const service = typeof payload.service === "string" ? payload.service.trim() : "";
  const message = typeof payload.message === "string" ? payload.message.trim() : "";
  const website = typeof payload.website === "string" ? payload.website.trim() : "";

  if (website) {
    return jsonResponse({ error: "The submission could not be verified." }, 400, origin);
  }

  if (
    !name || name.length > 120 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 ||
    phone.length > 40 ||
    !["business", "individual"].includes(audience) ||
    service.length > 160 ||
    !message || message.length > 5000
  ) {
    return jsonResponse({ error: "Please check the enquiry details and try again." }, 400, origin);
  }

  const apiKey = Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("RESEND_FROM_EMAIL");
  if (!apiKey || !from) {
    console.error("Email notification is not configured. Set RESEND_API_KEY and RESEND_FROM_EMAIL.");
    return jsonResponse({ error: "Email notification is not configured." }, 503, origin);
  }

  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safePhone = escapeHtml(phone || "Not provided");
  const safeAudience = escapeHtml(audience);
  const safeService = escapeHtml(service || "Not specified");
  const safeMessage = escapeHtml(message).replace(/\r?\n/g, "<br>");
  const subject = service ? `New website enquiry — ${service}` : "New website enquiry";
  const text = [
    "A new enquiry was submitted on rizqone.com.",
    "",
    `Name: ${name}`,
    `Email: ${email}`,
    `Phone: ${phone || "Not provided"}`,
    `Audience: ${audience}`,
    `Area of interest: ${service || "Not specified"}`,
    "",
    "Goals:",
    message,
  ].join("\n");

  let emailResponse: Response;
  try {
    emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: ["info@rizqone.com"],
        reply_to: email,
        subject,
        text,
        html: `<h2>New website enquiry</h2><p><strong>Name:</strong> ${safeName}</p><p><strong>Email:</strong> ${safeEmail}</p><p><strong>Phone:</strong> ${safePhone}</p><p><strong>Audience:</strong> ${safeAudience}</p><p><strong>Area of interest:</strong> ${safeService}</p><p><strong>Goals:</strong><br>${safeMessage}</p>`,
      }),
    });
  } catch (error) {
    console.error("Resend request failed before a response was received.", error);
    return jsonResponse({ error: "The enquiry was saved, but its email notification could not be sent." }, 502, origin);
  }

  if (!emailResponse.ok) {
    console.error(`Resend rejected an enquiry notification (HTTP ${emailResponse.status}).`);
    return jsonResponse({ error: "The enquiry was saved, but its email notification could not be sent." }, 502, origin);
  }

  return jsonResponse({ message: "Enquiry email sent." }, 200, origin);
});

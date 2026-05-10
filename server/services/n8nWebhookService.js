const N8N_REQUEST_TIMEOUT_MS = Number(process.env.N8N_REQUEST_TIMEOUT_MS || 6000);

const webhookMap = {
  userSignup: process.env.N8N_WEBHOOK_USER_SIGNUP_URL,
  testComplete: process.env.N8N_WEBHOOK_TEST_COMPLETE_URL,
};

function withDefaultHeaders(headers = {}) {
  const merged = { "Content-Type": "application/json", ...headers };
  if (process.env.N8N_WEBHOOK_SECRET) {
    merged["x-n8n-secret"] = process.env.N8N_WEBHOOK_SECRET;
  }
  return merged;
}

export async function sendN8nWebhook(eventName, payload, options = {}) {
  const webhookUrl = webhookMap[eventName] || options.url;
  if (!webhookUrl) return { skipped: true, reason: "Webhook URL not configured" };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), N8N_REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: withDefaultHeaders(options.headers),
      body: JSON.stringify({
        event: eventName,
        createdAt: new Date().toISOString(),
        ...payload,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(`n8n webhook failed (${response.status}): ${body}`);
    }

    return { ok: true };
  } finally {
    clearTimeout(timeout);
  }
}

export function sendN8nWebhookInBackground(eventName, payload, options = {}) {
  sendN8nWebhook(eventName, payload, options).catch((error) => {
    console.error(`[n8n] Failed sending "${eventName}" webhook:`, error.message);
  });
}

type WebhookMap = Record<string, string>;

type TurnstileResult = {
  success: boolean;
  hostname?: string;
  action?: string;
  ['error-codes']?: string[];
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}

function webhookKeyForSource(source: string): string | null {
  if (source === 'avoid-foreclosure') return 'foreclosure';
  if (source === 'sell-as-is') return 'sell_as_is';
  if (source === 'senior-living-transition') return 'senior_living';
  if (source === 'senior-care-help') return 'senior_care';
  if (source === 'contact') return 'contact';
  if (source === 'compare') return 'compare';
  if (source === 'faq') return 'faq';

  if (
    source === 'sell-your-house' ||
    source === 'get-a-cash-offer-today' ||
    source === 'how-we-buy-houses' ||
    source === 'testimonials' ||
    source.startsWith('sell-my-house-fast-')
  ) {
    return 'general';
  }

  return null;
}

export const onRequestPost = async (context: any) => {
  const { request, env } = context;

  if (!env?.TURNSTILE_SECRET_KEY || !env?.GHL_WEBHOOKS) {
    return json({ ok: false, error: 'Server configuration incomplete.' }, 500);
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return json({ ok: false, error: 'Invalid form submission.' }, 400);
  }

  // Honeypot: real visitors never see or fill this field.
  const honeypot = String(formData.get('company_website') || '').trim();
  if (honeypot) {
    // Return success so simple bots do not learn how they were blocked.
    return json({ ok: true });
  }

  const token = String(formData.get('cf-turnstile-response') || '').trim();
  if (!token) {
    return json({ ok: false, error: 'Verification required.' }, 400);
  }

  const verifyBody = new FormData();
  verifyBody.append('secret', env.TURNSTILE_SECRET_KEY);
  verifyBody.append('response', token);

  const ip = request.headers.get('CF-Connecting-IP');
  if (ip) verifyBody.append('remoteip', ip);

  let verification: TurnstileResult;
  try {
    const verifyResponse = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      { method: 'POST', body: verifyBody }
    );
    verification = (await verifyResponse.json()) as TurnstileResult;
  } catch {
    return json({ ok: false, error: 'Verification service unavailable.' }, 503);
  }

  if (!verification.success) {
    return json({ ok: false, error: 'Verification failed.' }, 403);
  }

  if (verification.hostname !== 'arkansaspropertybuyers.com') {
    return json({ ok: false, error: 'Invalid verification hostname.' }, 403);
  }

  if (verification.action && verification.action !== 'lead_form') {
    return json({ ok: false, error: 'Invalid verification action.' }, 403);
  }

  const source = String(formData.get('source') || '').trim();
  const webhookKey = webhookKeyForSource(source);
  if (!webhookKey) {
    return json({ ok: false, error: 'Unknown lead source.' }, 400);
  }

  let webhooks: WebhookMap;
  try {
    webhooks = JSON.parse(env.GHL_WEBHOOKS) as WebhookMap;
  } catch {
    return json({ ok: false, error: 'Webhook configuration invalid.' }, 500);
  }

  const webhookUrl = webhooks[webhookKey];
  if (
    !webhookUrl ||
    !webhookUrl.startsWith('https://services.leadconnectorhq.com/')
  ) {
    return json({ ok: false, error: 'Lead route is not configured.' }, 500);
  }

  // Do not forward anti-spam implementation details into GoHighLevel.
  formData.delete('cf-turnstile-response');
  formData.delete('company_website');

  try {
    const ghlResponse = await fetch(webhookUrl, {
      method: 'POST',
      body: formData,
    });

    if (!ghlResponse.ok) {
      return json({ ok: false, error: 'Lead delivery failed.' }, 502);
    }
  } catch {
    return json({ ok: false, error: 'Lead delivery failed.' }, 502);
  }

  return json({ ok: true });
};

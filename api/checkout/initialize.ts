import {
  readServerEnv,
  serverSupabase,
  json,
  assertSameOrigin,
  normaliseEmail,
  normaliseReference,
} from '../_lib/server';

interface IncomingLine {
  id: string;
  quantity: number;
}

const isUuid = (value: string): boolean =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

const MAX_LINES = 50;
const MAX_QUANTITY_PER_LINE = 20;

/**
 * POST /api/checkout/initialize
 *
 * Creates a Paystack transaction using the secret key, which never leaves the
 * server. Returns the hosted checkout URL for the browser to redirect to.
 *
 * The total is recomputed here from the `products` table using the service role.
 * The client sends only product ids and quantities, so a tampered payload cannot
 * change what is charged.
 */
export default async function handler(request: Request): Promise<{ status: number; headers: Record<string, string>; body: string }> {
  if (request.method !== 'POST') {
    return json(405, { error: 'Method not allowed' });
  }

  const { env, missing } = readServerEnv();
  if (missing.length > 0) {
    // Deliberately names the variables so the misconfiguration is obvious in
    // logs, without echoing any values.
    console.error(`[checkout] Missing server environment: ${missing.join(', ')}`);
    return json(500, { error: 'Payments are not configured on this deployment yet.' });
  }

  if (!assertSameOrigin(request.headers.get('origin') || undefined, env.siteUrl || 'https://cedokamall.com')) {
    return json(403, { error: 'Request origin is not allowed.' });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json(400, { error: 'Invalid request body.' });
  }

  const body = (payload ?? {}) as {
    items?: unknown;
    email?: unknown;
    reference?: unknown;
  };

  const email = normaliseEmail(body.email);
  if (!email) {
    return json(400, { error: 'A valid email address is required.' });
  }

  const reference = normaliseReference(body.reference);
  if (!reference) {
    return json(400, { error: 'A valid order reference is required.' });
  }

  if (!Array.isArray(body.items) || body.items.length === 0) {
    return json(400, { error: 'Your cart is empty.' });
  }
  if (body.items.length > MAX_LINES) {
    return json(400, { error: 'Too many distinct items in one order.' });
  }

  // Collapse duplicate ids so a repeated line cannot be used to skew totals.
  const requested = new Map<string, number>();
  for (const entry of body.items as IncomingLine[]) {
    const id = typeof entry?.id === 'string' ? entry.id : '';
    if (!isUuid(id)) {
      return json(400, { error: 'Cart contains an invalid product reference.' });
    }
    const quantity = Math.floor(Number(entry?.quantity));
    if (!Number.isFinite(quantity) || quantity < 1) {
      return json(400, { error: 'Cart contains an invalid quantity.' });
    }
    const next = (requested.get(id) ?? 0) + quantity;
    if (next > MAX_QUANTITY_PER_LINE) {
      return json(400, { error: `Maximum ${MAX_QUANTITY_PER_LINE} units per item.` });
    }
    requested.set(id, next);
  }

  const ids = [...requested.keys()];
  const supabase = serverSupabase(env.supabaseUrl, env.serviceRoleKey);

  const { data: rows, error: lookupError } = await supabase
    .from('products')
    .select('id, name, price, stock, out_of_stock, image')
    .in('id', ids);

  if (lookupError) {
    console.error('[checkout] Product lookup failed:', lookupError.message);
    return json(500, { error: 'Could not price your order. Please try again.' });
  }

  const products = rows ?? [];
  if (products.length !== ids.length) {
    return json(409, { error: 'An item in your cart is no longer available.' });
  }

  // Authoritative pricing, computed server side.
  let totalKobo = 0;
  const lineItems = products.map((product) => {
    const quantity = requested.get(product.id) ?? 1;
    const unitPriceKobo = Math.round(Number(product.price) * 100);
    totalKobo += unitPriceKobo * quantity;
    return {
      name: String(product.name ?? 'Product'),
      quantity,
      unitPriceKobo,
    };
  });

  const unavailable = products.find(
    (product) => Boolean(product.out_of_stock) || Number(product.stock ?? 0) < (requested.get(product.id) ?? 1)
  );
  if (unavailable) {
    return json(409, {
      error: `${unavailable.name} does not have enough stock for that quantity.`,
    });
  }

  if (totalKobo <= 0) {
    return json(400, { error: 'Order total resolved to zero.' });
  }

  // Talk to Paystack from the server so the secret key is never exposed.
  const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.paystackSecretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      reference,
      amount: totalKobo,
      currency: 'NGN',
      channels: ['card', 'bank', 'ussd', 'mobile_money'],
      metadata: {
        source: 'cedokamall-web',
        order_reference: reference,
        line_items: lineItems.map((line) => ({
          name: line.name,
          quantity: line.quantity,
          unit_price: line.unitPriceKobo,
        })),
      },
    }),
  });

  const paystackBody = (await paystackResponse.json().catch(() => null)) as
    | { status?: boolean; message?: string; data?: { authorization_url?: string; reference?: string } }
    | null;

  if (!paystackResponse.ok || !paystackBody?.status || !paystackBody.data?.authorization_url) {
    console.error('[checkout] Paystack initialize failed:', paystackBody?.message ?? paystackResponse.status);
    return json(502, { error: 'Could not start the payment. Please try again.' });
  }

  return json(200, {
    authorizationUrl: paystackBody.data.authorization_url,
    reference: paystackBody.data.reference ?? reference,
    amountKobo: totalKobo,
  });
}

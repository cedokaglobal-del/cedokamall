/**
 * Browser-side client for the server checkout.
 *
 * This module deliberately contains no keys of any kind. It only talks to our own
 * `/api` routes, and the secret credentials stay on the server.
 */

export interface CheckoutLine {
  id: string;
  quantity: number;
}

export interface CheckoutResult {
  ok: boolean;
  authorizationUrl?: string;
  reference?: string;
  amountKobo?: number;
  error?: string;
}

export class CheckoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CheckoutError';
  }
}

/**
 * Asks the server to create a payment session and returns the hosted checkout URL.
 *
 * Prices are recomputed on the server from the database, so the amounts sent from
 * here are advisory only.
 */
export const initializeCheckout = async (input: {
  items: CheckoutLine[];
  email: string;
  reference: string;
}): Promise<CheckoutResult> => {
  try {
    const response = await fetch('/api/checkout/initialize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: input.items.map((line) => ({ id: line.id, quantity: line.quantity })),
        email: input.email,
        reference: input.reference,
      }),
    });

    const data = (await response.json().catch(() => null)) as
      | (CheckoutResult & { error?: string })
      | null;

    if (!response.ok) {
      const message = data?.error ?? 'Could not start the payment. Please try again.';
      throw new CheckoutError(message);
    }

    if (!data?.authorizationUrl) {
      throw new CheckoutError('The payment provider did not return a checkout link.');
    }

    return data;
  } catch (error) {
    if (error instanceof CheckoutError) {
      return { ok: false, error: error.message };
    }
    return {
      ok: false,
      error: 'Could not reach the payment service. Check your connection and try again.',
    };
  }
};

/**
 * Helpers for launching the Wompi checkout widget.
 *
 * Wompi's CloudFront WAF rejects (403) any widget URL whose `redirect-url`
 * contains `localhost` or `127.0.0.1`. In dev we rewrite those hosts to
 * `lvh.me` — a public DNS alias that resolves to 127.0.0.1 — so the widget
 * loads correctly and the browser still lands back on the local dev server.
 *
 * Production hostnames (hypepass.com, etc.) are passed through unchanged.
 */

const WOMPI_SCRIPT_SRC = 'https://checkout.wompi.co/widget.js';

export function loadWompiWidget(): Promise<void> {
  if (typeof (window as any).WidgetCheckout === 'function') {
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(
      `script[src="${WOMPI_SCRIPT_SRC}"]`,
    );
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('wompi')));
      return;
    }
    const s = document.createElement('script');
    s.src = WOMPI_SCRIPT_SRC;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('wompi load failed'));
    document.body.appendChild(s);
  });
}

/**
 * Wompi's WAF blocks `localhost`/`127.0.0.1` in the redirect-url query param.
 * Substitute the hostname with `lvh.me` (resolves to 127.0.0.1) so the widget
 * loads in dev. Everything else (port, path, query) is preserved.
 */
export function wompiSafeRedirect(url: string): string {
  try {
    const u = new URL(url);
    if (u.hostname === 'localhost' || u.hostname === '127.0.0.1') {
      u.hostname = 'lvh.me';
    }
    return u.toString();
  } catch {
    return url;
  }
}

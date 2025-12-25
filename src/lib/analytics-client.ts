/**
 * Utility to track analytics events from the client side.
 */
export async function track(type: string, payload?: any) {
  try {
    // Get source from URL if present
    const urlParams = new URLSearchParams(window.location.search);
    const source =
      urlParams.get('utm_source') || urlParams.get('source') || 'direct';

    await fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        payload,
        source,
      }),
    });
  } catch (e) {
    console.warn('Analytics tracking failed:', e);
  }
}

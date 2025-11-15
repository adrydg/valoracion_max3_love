import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const events = await request.json();

    // Log en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Analytics events received:', events);
    }

    // TODO: Aquí puedes enviar a GA4, Mixpanel, etc.
    // Por ahora solo lo logueamos

    // Ejemplo con GA4 (descomentar cuando configures):
    /*
    const measurement_id = process.env.GA4_MEASUREMENT_ID;
    const api_secret = process.env.GA4_API_SECRET;

    if (measurement_id && api_secret) {
      await fetch(
        `https://www.google-analytics.com/mp/collect?measurement_id=${measurement_id}&api_secret=${api_secret}`,
        {
          method: 'POST',
          body: JSON.stringify({
            client_id: request.headers.get('x-client-id') || 'anonymous',
            events: events.map((e: any) => ({
              name: e.event,
              params: e.properties,
            })),
          }),
        }
      );
    }
    */

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics error:', error);
    // No fallar - analytics no debe romper la app
    return NextResponse.json({ success: false }, { status: 200 });
  }
}

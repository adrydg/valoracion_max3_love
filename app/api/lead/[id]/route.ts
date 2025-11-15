import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: leadId } = await params;
    const body = await request.json();

    console.log(`Actualizando lead ${leadId}:`, body);

    // TODO: Actualizar en base de datos real
    // Por ahora solo logueamos

    const { directOfferInterest } = body;

    if (directOfferInterest) {
      // Log para analytics
      console.log(`Lead ${leadId} - Oferta directa: ${directOfferInterest}`);
    }

    return NextResponse.json({
      success: true,
      message: "Lead actualizado correctamente",
    });
  } catch (error) {
    console.error("Error actualizando lead:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

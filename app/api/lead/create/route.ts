import { NextResponse } from "next/server";
import { nanoid } from "nanoid";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      // Datos personales
      name,
      email,
      phone,
      consentMarketing,
      consentDataProcessing,

      // Datos de propiedad
      propertyType,
      bedrooms,
      postalCode,
      street,
      squareMeters,
      bathrooms,
      floor,
      hasElevator,
      buildingAge,
    } = body;

    // Validaciones básicas
    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: "Faltan datos personales obligatorios" },
        { status: 400 }
      );
    }

    if (!postalCode || !squareMeters || !bedrooms) {
      return NextResponse.json(
        { error: "Faltan datos de propiedad obligatorios" },
        { status: 400 }
      );
    }

    if (!consentDataProcessing) {
      return NextResponse.json(
        { error: "Debes aceptar la política de privacidad" },
        { status: 400 }
      );
    }

    // Generar ID único para el lead
    const leadId = nanoid();

    // TODO: Guardar en base de datos real
    // Por ahora simulamos con un objeto en memoria
    const lead = {
      id: leadId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: "incomplete",

      // Datos personales
      name,
      email,
      phone,
      rgpd_consent: consentDataProcessing,
      marketing_consent: consentMarketing,

      // Datos de propiedad
      property_type: propertyType,
      bedrooms,
      postal_code: postalCode,
      street,
      square_meters: squareMeters,
      bathrooms,
      floor,
      has_elevator: hasElevator,
      building_age: buildingAge,

      // Valoración (se llenará después)
      valuation_type: null,
      valuation_avg: null,
      valuation_min: null,
      valuation_max: null,
      valuation_uncertainty: null,

      // Oferta directa (se llenará después)
      direct_offer_interest: null,
    };

    console.log("Lead creado:", lead);

    // TODO: Enviar email de bienvenida
    // TODO: Notificar al CRM

    return NextResponse.json({
      success: true,
      leadId,
      message: "Lead creado correctamente",
    });
  } catch (error) {
    console.error("Error creando lead:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

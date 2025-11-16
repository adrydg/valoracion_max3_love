import { NextResponse } from "next/server";
import preciosPorCP from "@/data/precios_por_cp.json";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cp = searchParams.get("cp");

  if (!cp) {
    return NextResponse.json({ error: "Código postal requerido" }, { status: 400 });
  }

  const cpData = (preciosPorCP as any)[cp];

  if (cpData) {
    return NextResponse.json({
      found: true,
      municipio: cpData.municipio,
      provincia: cpData.provincia,
      precio: cpData.precio,
    });
  }

  return NextResponse.json({ found: false });
}

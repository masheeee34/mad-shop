import { NextResponse } from "next/server";

/**
 * Route désactivée — le widget de chat a été remplacé par un FAQ statique.
 * Conservée pour éviter les erreurs 404 sur d'éventuels appels résiduels.
 */
export async function POST() {
  return NextResponse.json(
    { message: "Ce service est géré via la page Contact." },
    { status: 200 }
  );
}

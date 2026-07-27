import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/admin-auth";
import { getSettings, setSettings } from "@/lib/data/settings";

export async function GET() {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const settings = await getSettings();
  return NextResponse.json(settings);
}

export async function POST(req: Request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const settings = await getSettings();
    
    if (typeof body.testMode === "boolean") {
      settings.testMode = body.testMode;
      await setSettings(settings);
    }
    
    return NextResponse.json({ success: true, settings });
  } catch (err) {
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}

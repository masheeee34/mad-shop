import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/admin-auth";
import { getSettings, setSettings } from "@/lib/data/settings";

export async function GET() {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const settings = await getSettings();
  const store = await cookies();
  settings.testMode = settings.testMode || store.get("test_mode")?.value === "1";
  return NextResponse.json(settings);
}

export async function POST(req: Request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const settings = await getSettings();
    const store = await cookies();
    
    if (typeof body.testMode === "boolean") {
      settings.testMode = body.testMode;
      await setSettings(settings).catch(() => {}); // ignorer l'erreur Vercel FS
      
      if (body.testMode) {
        store.set("test_mode", "1", { path: "/" });
      } else {
        store.delete("test_mode");
      }
    }
    
    return NextResponse.json({ success: true, settings });
  } catch (err: any) {
    console.error("[settings error]", err);
    return NextResponse.json({ error: "Erreur", details: err?.message || String(err) }, { status: 500 });
  }
}

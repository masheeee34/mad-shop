"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    await fetch("/api/compte/deconnexion", { method: "POST" }).catch(() => {});
    router.push("/");
    router.refresh();
  }

  return (
    <Button variant="outline" size="md" onClick={logout} disabled={loading}>
      {loading ? (
        <>
          <Loader2 className="size-4 animate-spin" /> Déconnexion…
        </>
      ) : (
        <>
          <LogOut className="size-4" /> Se déconnecter
        </>
      )}
    </Button>
  );
}

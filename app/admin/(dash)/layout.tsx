import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/admin-auth";
import { Logo } from "@/components/brand/logo";
import { AdminNav } from "@/components/admin/admin-nav";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Administration",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await isAuthed())) redirect("/admin/login");

  return (
    <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 lg:grid-cols-[260px_1fr]">
      <aside className="hidden border-r border-line bg-charcoal p-6 lg:block">
        <div className="mb-8 flex items-center gap-3">
          <Logo variant="full" className="h-11" />
          <span className="text-xs uppercase tracking-[0.2em] text-faint">Admin</span>
        </div>
        <AdminNav />
      </aside>
      <div className="min-w-0">
        {/* Nav mobile */}
        <div className="border-b border-line bg-charcoal p-4 lg:hidden">
          <AdminNav />
        </div>
        <main className="p-6 md:p-10">{children}</main>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentCustomer } from "@/lib/customer-auth";
import { LoginForm } from "@/components/account/login-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Connexion",
  description: "Accédez à votre espace client MAD Shop et suivez vos commandes.",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ erreur?: string }>;
}) {
  if (await currentCustomer()) redirect("/compte");

  const { erreur } = await searchParams;

  return (
    <div className="shell grid min-h-[70vh] place-items-center pt-28 pb-16">
      <div className="w-full max-w-md">
        <span className="gold-rule" />
        <h1 className="display mt-3 text-3xl md:text-4xl">Espace client</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Saisissez l&apos;adresse utilisée lors de votre commande. Nous vous
          envoyons un lien de connexion : pas de mot de passe à retenir.
        </p>

        {erreur === "lien" && (
          <p
            role="alert"
            className="mt-5 rounded-xl border border-it-red/30 bg-it-red/5 px-4 py-3 text-sm text-it-red"
          >
            Ce lien de connexion a expiré ou a déjà été utilisé. Demandez-en un
            nouveau ci-dessous.
          </p>
        )}

        <div className="mt-6">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}

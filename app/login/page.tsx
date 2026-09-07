import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";
import { AutoSignIn } from "./auto-sign-in";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { callbackUrl?: string };
}) {
  const session = await auth();
  if (session) {
    redirect(searchParams.callbackUrl ?? "/");
  }

  return (
    <main className="shell">
      <div className="panel p-10 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-700 text-2xl text-white shadow-sm">
          🌿
        </div>
        <h1 className="text-2xl font-semibold text-slate-900">Sign in to Project Garden</h1>
        <p className="mt-3 text-sm text-slate-600">
          Redirecting you to Pocket ID to sign in…
        </p>
        <form
          className="mt-6"
          action={async () => {
            "use server";
            await signIn("pocket-id", {
              redirectTo: searchParams.callbackUrl ?? "/",
            });
          }}
        >
          <button type="submit" data-auto-sign-in className="button-primary">
            Sign in with Pocket ID
          </button>
          <AutoSignIn />
        </form>
      </div>
    </main>
  );
}

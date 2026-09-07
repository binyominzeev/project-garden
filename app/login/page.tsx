import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";
import { AutoSignIn } from "./auto-sign-in";

const errorMessages: Record<string, string> = {
  OAuthCallbackError: "Pocket ID returned an error during sign-in.",
  AccessDenied: "Access was denied.",
  Configuration: "There is a problem with the server configuration.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { callbackUrl?: string; error?: string };
}) {
  const session = await auth();
  if (session) {
    redirect(searchParams.callbackUrl ?? "/");
  }

  const error = searchParams.error;

  return (
    <main className="shell">
      <div className="panel p-10 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-700 text-2xl text-white shadow-sm">
          🌿
        </div>
        <h1 className="text-2xl font-semibold text-slate-900">Sign in to Project Garden</h1>
        {error ? (
          <p className="mt-3 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
            {errorMessages[error] ?? "Sign-in failed."} ({error}) Use the button below to
            try again.
          </p>
        ) : (
          <p className="mt-3 text-sm text-slate-600">
            Redirecting you to Pocket ID to sign in…
          </p>
        )}
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
          {!error && <AutoSignIn />}
        </form>
      </div>
    </main>
  );
}

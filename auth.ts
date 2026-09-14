import NextAuth from "next-auth";

const isProduction = process.env.NODE_ENV === "production";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    {
      id: "pocket-id",
      name: "Pocket ID",
      type: "oidc",
      issuer: process.env.POCKET_ID_ISSUER ?? "https://auth.binjomin.hu",
      clientId: process.env.POCKET_ID_CLIENT_ID,
      clientSecret: process.env.POCKET_ID_CLIENT_SECRET,
      checks: ["pkce", "state"],
    },
  ],
  pages: {
    signIn: "/login",
  },
  cookies: {
    state: {
      name: "authjs.state",
      options: {
        httpOnly: true,
        sameSite: isProduction ? "none" : "lax",
        path: "/",
        secure: isProduction,
      },
    },
    pkceCodeVerifier: {
      name: "authjs.pkce.code_verifier",
      options: {
        httpOnly: true,
        sameSite: isProduction ? "none" : "lax",
        path: "/",
        secure: isProduction,
        maxAge: 60 * 15,
      },
    },
    callbackUrl: {
      name: "authjs.callback-url",
      options: {
        sameSite: isProduction ? "none" : "lax",
        path: "/",
        secure: isProduction,
      },
    },
  },
});

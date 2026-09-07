import NextAuth from "next-auth";

export const { handlers, auth, signIn, signOut } = NextAuth({
  // TEMP: diagnosztika a Pocket ID callback hibához – a javítás után töröld
  debug: true,
  providers: [
    {
      id: "pocket-id",
      name: "Pocket ID",
      type: "oidc",
      issuer: process.env.POCKET_ID_ISSUER ?? "https://auth.binjomin.hu",
      clientId: process.env.POCKET_ID_CLIENT_ID,
      clientSecret: process.env.POCKET_ID_CLIENT_SECRET,
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
        sameSite: "none",
        path: "/",
        secure: true,
      },
    },
    pkceCodeVerifier: {
      name: "authjs.pkce.code_verifier",
      options: {
        httpOnly: true,
        sameSite: "none",
        path: "/",
        secure: true,
        maxAge: 60 * 15,
      },
    },
    callbackUrl: {
      name: "authjs.callback-url",
      options: {
        sameSite: "none",
        path: "/",
        secure: true,
      },
    },
  },
});

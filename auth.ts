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
});

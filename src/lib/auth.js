import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { legacyAdminUserService } from "@/lib/composition-root";

export const authOptions = {
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Admin Login",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "admin" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const adminUser = process.env.ADMIN_USERNAME || "admin";
        const adminPass = process.env.ADMIN_PASSWORD || "admin";

        if (credentials.username === adminUser && credentials.password === adminPass) {
          // Resolve the temporary legacy admin identity through the compatibility service.
          const email = "admin@oicards.local";
          const user = await legacyAdminUserService.ensure(email, "Shop Admin");
          const { ensureBootstrapAdmin } = await import("@/lib/composition-root");
          await ensureBootstrapAdmin.execute(email, "Shop Admin");
          return { id: user.id, name: user.name, email: user.email };
        }
        return null; // Login failed
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
      }
      // Provision Google OAuth customers into our database
      if (account?.provider === "google" && account?.access_token) {
        try {
          const { provisionGoogleCustomer } = await import("@/features/auth/oauth-actions");
          const result = await provisionGoogleCustomer({
            email: token.email ?? user?.email ?? "",
            name: token.name ?? user?.name ?? "",
            image: token.picture ?? null,
          });
          token.customerId = result.customerId;
          token.workspaceId = result.workspaceId;
          token.isNewCustomer = result.isNew;
        } catch (err) {
          console.error("[auth] Google OAuth provisioning failed:", err);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback_secret_for_development_only",
  pages: {
    signIn: "/admin/login",
  },
};

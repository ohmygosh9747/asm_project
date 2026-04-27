import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
<<<<<<< HEAD
import { compare } from "bcryptjs";
import { db } from "@/lib/db";
=======
import bcrypt from "bcryptjs";
import { db } from "./db";
>>>>>>> f04e20575b112f284b1efdeb812b6cc0d0fbd454

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
<<<<<<< HEAD
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error("Invalid email or password");
        }

        const isValid = await compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error("Invalid email or password");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
=======
        if (!credentials?.email || !credentials?.password) return null;
        const user = await db.user.findUnique({ where: { email: credentials.email } });
        if (!user) return null;
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;
        return { id: user.id, email: user.email, name: user.name, role: user.role };
>>>>>>> f04e20575b112f284b1efdeb812b6cc0d0fbd454
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
<<<<<<< HEAD
        token.id = user.id;
        token.role = (user as { role: string }).role;
=======
        token.role = (user as any).role;
        token.id = user.id;
>>>>>>> f04e20575b112f284b1efdeb812b6cc0d0fbd454
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
<<<<<<< HEAD
        (session.user as { id: string }).id = token.id as string;
        (session.user as { role: string }).role = token.role as string;
=======
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
>>>>>>> f04e20575b112f284b1efdeb812b6cc0d0fbd454
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
  session: {
    strategy: "jwt",
<<<<<<< HEAD
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
=======
  },
  secret: process.env.NEXTAUTH_SECRET || "asm-secret-key-change-in-production",
>>>>>>> f04e20575b112f284b1efdeb812b6cc0d0fbd454
};

import { PrismaAdapter } from '@next-auth/prisma-adapter'
import NextAuth from 'next-auth'
import GitHub from 'next-auth/providers/github'
import { db } from './db'

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: 'database' },
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],
  pages: { signIn: '/signin' },
  callbacks: {
    // Enforce auth in middleware: only allow when a session exists
    authorized({ auth }) {
      return !!auth
    },
  },
})

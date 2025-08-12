import { PrismaAdapter } from '@next-auth/prisma-adapter'
import NextAuth, { getServerSession, type NextAuthOptions } from 'next-auth'
import GitHub from 'next-auth/providers/github'
import { db } from './db'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  session: { strategy: 'database' },
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],
  pages: { signIn: '/signin' },
}

export const auth = () => getServerSession(authOptions)

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }

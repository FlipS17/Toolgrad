import { prisma } from '@/utils/db'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { compare } from 'bcryptjs'
import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'

export const authOptions: NextAuthOptions = {
	adapter: PrismaAdapter(prisma),
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
		}),
		CredentialsProvider({
			name: 'Credentials',
			credentials: {
				email: { label: 'Email', type: 'email' },
				password: { label: 'Пароль', type: 'password' },
			},
			async authorize(credentials) {
				if (!credentials?.email || !credentials?.password) return null

				const user = await prisma.user.findUnique({
					where: { email: credentials.email },
				})

				if (!user || !user.password) return null

				const isValid = await compare(credentials.password, user.password)
				if (!isValid) return null

				return {
					id: user.id.toString(),
					email: user.email,
					name: `${user.firstName} ${user.lastName}`,
				}
			},
		}),
	],
	session: { strategy: 'jwt' },
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.id = (user as any).id?.toString() ?? ''
				token.email = (user as any).email ?? ''
				token.name = (user as any).name ?? ''
			}
			return token
		},
		async session({ session, token }) {
			if (session.user && token) {
				;(session.user as any).id = token.id ?? ''
				session.user.email = token.email ?? ''
				session.user.name = token.name ?? ''
			}
			return session
		},
	},
	pages: {
		signIn: '/account',
	},
	secret: process.env.NEXTAUTH_SECRET,
}

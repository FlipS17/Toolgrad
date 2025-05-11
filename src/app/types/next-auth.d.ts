// types/next-auth.d.ts
import 'next-auth'

declare module 'next-auth' {
	interface Session {
		user: {
			id: number
			email: string
			name?: string
		}
	}
}

declare module 'next-auth/jwt' {
	interface JWT {
		id: number
	}
}

import { withAuth } from 'next-auth/middleware'

export default withAuth({
	pages: {
		signIn: '/account',
	},
})

export const config = {
	matcher: ['/account/profile', '/account/delivery', '/account/orders'],
}

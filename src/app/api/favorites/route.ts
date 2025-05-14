import { authOptions } from '@/app/lib/authOptions'
import { prisma } from '@/utils/db'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

export async function GET() {
	const session = await getServerSession(authOptions)

	if (!session?.user?.email) {
		return NextResponse.json([], { status: 401 })
	}

	const user = await prisma.user.findUnique({
		where: { email: session.user.email },
		include: { favorites: true },
	})

	const favoriteIds = user?.favorites.map(f => f.productId) || []

	return NextResponse.json(favoriteIds)
}

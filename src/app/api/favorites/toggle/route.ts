import { authOptions } from '@/app/lib/authOptions'
import { prisma } from '@/utils/db'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
	const session = await getServerSession(authOptions)

	if (!session?.user?.email) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	}

	const { productId } = await req.json()

	const user = await prisma.user.findUnique({
		where: { email: session.user.email },
	})

	if (!user) {
		return NextResponse.json({ error: 'User not found' }, { status: 404 })
	}

	const existing = await prisma.favorite.findUnique({
		where: {
			userId_productId: {
				userId: user.id,
				productId,
			},
		},
	})

	if (existing) {
		await prisma.favorite.delete({
			where: { id: existing.id },
		})
	} else {
		await prisma.favorite.create({
			data: {
				userId: user.id,
				productId,
			},
		})
	}

	return NextResponse.json({ success: true })
}

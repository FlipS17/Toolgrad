import { authOptions } from '@/app/lib/authOptions'
import { prisma } from '@/utils/db'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

export async function GET() {
	const session = await getServerSession(authOptions)

	if (!session?.user?.email) {
		return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
	}

	try {
		const user = await prisma.user.findUnique({
			where: { email: session.user.email },
			select: {
				id: true,
				email: true,
				firstName: true,
				lastName: true,
				birthDate: true,
				avatar: true,
				createdAt: true,
				updatedAt: true,
			},
		})

		if (!user) {
			return NextResponse.json({ message: 'User not found' }, { status: 404 })
		}

		return NextResponse.json(user)
	} catch (error) {
		return NextResponse.json(
			{ message: 'Internal server error', error },
			{ status: 500 }
		)
	}
}

export async function PUT(req: Request) {
	const session = await getServerSession(authOptions)

	if (!session?.user?.email) {
		return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
	}

	const data = await req.json()
	const { firstName, lastName, birthDate } = data

	if (!firstName || !lastName) {
		return NextResponse.json({ message: 'Missing fields' }, { status: 400 })
	}

	try {
		await prisma.user.update({
			where: { email: session.user.email },
			data: {
				firstName,
				lastName,
				birthDate: birthDate ? new Date(birthDate) : null,
			},
		})

		return NextResponse.json({ message: 'Updated successfully' })
	} catch (error) {
		return NextResponse.json(
			{ message: 'Failed to update profile', error },
			{ status: 500 }
		)
	}
}

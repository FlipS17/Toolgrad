import { PrismaClient } from '@/../generated/prisma'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function GET() {
	try {
		const stores = await prisma.store.findMany({
			select: {
				id: true,
				name: true,
				latitude: true,
				longitude: true,
			},
		})

		return NextResponse.json(stores)
	} catch (error) {
		console.error('Ошибка при получении магазинов:', error)
		return NextResponse.json(
			{ error: 'Ошибка при загрузке магазинов' },
			{ status: 500 }
		)
	}
}

import { PrismaClient } from '@/../generated/prisma'
import DataTable from '@/app/admin/components/DataTable'
import Pagination from '@/app/admin/components/Pagination'

const prisma = new PrismaClient()

export default async function TablePage({
	params,
	searchParams,
}: {
	params: { table: string }
	searchParams: { page?: string }
}) {
	const table = params.table
	const page = parseInt(searchParams?.page || '1', 10)
	const limit = 50
	const offset = (page - 1) * limit

	let rows: any[] = []
	let total = 0

	switch (table) {
		case 'brand':
			;[rows, total] = await Promise.all([
				prisma.brand.findMany({ skip: offset, take: limit }),
				prisma.brand.count(),
			])
			break
		case 'user':
			;[rows, total] = await Promise.all([
				prisma.user.findMany({ skip: offset, take: limit }),
				prisma.user.count(),
			])
			break
		case 'product':
			;[rows, total] = await Promise.all([
				prisma.product.findMany({ skip: offset, take: limit }),
				prisma.product.count(),
			])
			break
		case 'order':
			;[rows, total] = await Promise.all([
				prisma.order.findMany({ skip: offset, take: limit }),
				prisma.order.count(),
			])
			break
		case 'review':
			;[rows, total] = await Promise.all([
				prisma.review.findMany({ skip: offset, take: limit }),
				prisma.review.count(),
			])
			break
		case 'slider':
			;[rows, total] = await Promise.all([
				prisma.slider.findMany({ skip: offset, take: limit }),
				prisma.slider.count(),
			])
			break
		default:
			return <div className='text-red-600'>Неизвестная таблица</div>
	}

	const totalPages = Math.ceil(total / limit)
	const columns = Object.keys(rows[0] || {})

	return (
		<div>
			<h1 className='text-2xl font-bold mb-4 capitalize'>{table}</h1>
			<DataTable columns={columns} rows={rows} table={table} />
			<Pagination table={table} currentPage={page} totalPages={totalPages} />
		</div>
	)
}

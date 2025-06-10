'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tables = ['Brand', 'User', 'Product', 'Order', 'Review', 'Slider']

export default function Sidebar() {
	const pathname = usePathname()

	return (
		<aside className='w-64 bg-gray-800 text-white p-4'>
			<h2 className='text-xl font-bold mb-4'>Панель администратора</h2>
			<nav className='flex flex-col space-y-2'>
				{tables.map(table => (
					<Link
						key={table}
						href={`/admin/${table.toLowerCase()}`}
						className={`px-3 py-2 rounded hover:bg-gray-700 ${
							pathname.includes(table.toLowerCase()) ? 'bg-gray-700' : ''
						}`}
					>
						{table}
					</Link>
				))}
			</nav>
		</aside>
	)
}

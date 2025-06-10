'use client'

import { useRouter } from 'next/navigation'

type Props = {
	table: string
	currentPage: number
	totalPages: number
}

export default function Pagination({ table, currentPage, totalPages }: Props) {
	const router = useRouter()

	// переход на нужную страницу
	const goToPage = (page: number) => {
		router.push(`/admin/${table}?page=${page}`)
	}

	// показываем максимум 5 страниц рядом с текущей
	const visiblePages = Array.from(
		{ length: totalPages },
		(_, i) => i + 1
	).filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)

	return (
		<div className='flex gap-2 mt-4 flex-wrap'>
			{visiblePages.map((page, i) => (
				<button
					key={i}
					onClick={() => goToPage(page)}
					className={`px-3 py-1 rounded border ${
						page === currentPage
							? 'bg-blue-600 text-white'
							: 'bg-white text-black'
					}`}
				>
					{page}
				</button>
			))}
		</div>
	)
}

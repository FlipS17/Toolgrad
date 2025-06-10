'use client'

import { useState } from 'react'

export default function DataTable({
	columns,
	rows,
	table,
}: {
	columns: string[]
	rows: any[]
	table: string
}) {
	const [data, setData] = useState(rows)

	const handleDelete = async (id: number) => {
		await fetch(`/api/admin/${table}/${id}`, { method: 'DELETE' })
		setData(data.filter(row => row.id !== id))
	}

	return (
		<div className='overflow-auto'>
			<table className='min-w-full border'>
				<thead>
					<tr>
						{columns.map(col => (
							<th key={col} className='border px-4 py-2 text-left'>
								{col}
							</th>
						))}
						<th className='border px-4 py-2'>Actions</th>
					</tr>
				</thead>
				<tbody>
					{data.map(row => (
						<tr key={row.id}>
							{columns.map(col => (
								<td key={col} className='border px-4 py-2'>
									{JSON.stringify(row[col])}
								</td>
							))}
							<td className='border px-4 py-2'>
								{/* Реализация редактирования и удаления */}
								<button
									onClick={() => handleDelete(row.id)}
									className='text-red-500 hover:underline'
								>
									Удалить
								</button>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	)
}

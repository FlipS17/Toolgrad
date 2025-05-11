'use client'

import { useRouter, useSearchParams } from 'next/navigation'

export function useUpdateSearchParams() {
	const router = useRouter()
	const searchParams = useSearchParams()

	const updateParams = (newParams: Record<string, string | number | null>) => {
		const params = new URLSearchParams(searchParams.toString())

		for (const key in newParams) {
			const value = newParams[key]
			if (value === null || value === '') {
				params.delete(key)
			} else {
				params.set(key, String(value))
			}
		}

		// Сброс страницы при изменении фильтров/сортировки
		params.set('page', '1')

		router.push(`?${params.toString()}`)
	}

	return updateParams
}

'use client'

interface Props {
	address?: {
		settlement?: string
		city: string
		street: string
		building: string
		apartment: string
		entrance?: string
		floor?: string
	}
}

export default function FormattedAddress({ address }: Props) {
	if (!address) return <>Адрес не указан</>

	const parts = [
		address.settlement || address.city,
		address.street,
		address.building ? `д. ${address.building}` : '',
		address.apartment ? `кв. ${address.apartment}` : '',
		address.entrance ? `подъезд ${address.entrance}` : '',
		address.floor ? `этаж ${address.floor}` : '',
	]

	return <>{parts.filter(Boolean).join(', ')}</>
}

'use client'

interface UserInfoProps {
	fullName: string
	email: string
	birthDate: string | null
}

export default function UserInfo({
	fullName,
	email,
	birthDate,
}: UserInfoProps) {
	const initials = fullName
		.split(' ')
		.map(word => word[0]?.toUpperCase())
		.join('')
		.slice(0, 2)

	return (
		<div className='bg-white rounded-xl shadow p-6 flex flex-col items-center sm:flex-row sm:items-start gap-4'>
			<div className='w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-green-100 text-green-900 text-2xl sm:text-3xl font-bold flex items-center justify-center'>
				{initials}
			</div>

			<div className='text-center sm:text-left'>
				<p className='text-lg sm:text-xl font-bold break-words'>{fullName}</p>
				<p className='break-words'>
					<span className='font-semibold'>Email:</span> {email}
				</p>
				<p>
					<span className='font-semibold'>Дата рождения:</span>{' '}
					{birthDate || '—'}
				</p>
			</div>
		</div>
	)
}

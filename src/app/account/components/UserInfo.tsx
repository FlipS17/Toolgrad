'use client'

interface UserInfoProps {
	fullName: string
	email: string
	birthDate: string | null
	avatar: number
}

export default function UserInfo({
	fullName,
	email,
	birthDate,
	avatar = 0,
}: UserInfoProps) {
	const initials = fullName
		.split(' ')
		.map(word => word[0]?.toUpperCase())
		.join('')
		.slice(0, 2)

	const colorClasses = [
		'bg-green-100 text-green-900',
		'bg-blue-100 text-blue-900',
		'bg-yellow-100 text-yellow-900',
		'bg-pink-100 text-pink-900',
	]

	const colorClass = colorClasses[avatar % colorClasses.length]

	return (
		<div className='bg-white rounded-xl shadow p-6 flex flex-col items-center sm:flex-row sm:items-start gap-4'>
			<div
				className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full text-2xl sm:text-3xl font-bold flex items-center justify-center ${colorClass}`}
			>
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

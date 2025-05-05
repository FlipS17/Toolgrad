import { faker } from '@faker-js/faker'
import {
	OrderStatus,
	PaymentMethod,
	PaymentStatus,
	PrismaClient,
	Role,
} from '../generated/prisma'

const prisma = new PrismaClient()

const categoryImages = [
	'/categories/tools-1.jpg',
	'/categories/tools-2.jpg',
	'/categories/tools-3.jpg',
	'/categories/tools-4.jpg',
	'/categories/tools-5.jpg',
]

const productImages = [
	'/products/hammer.jpg',
	'/products/drill.jpg',
	'/products/saw.jpg',
	'/products/screwdriver.jpg',
	'/products/wrench.jpg',
]

const brandLogos = Array.from(
	{ length: 10 },
	(_, i) => `/brands/logo-${i + 1}.png`
)

async function main() {
	await prisma.$transaction([
		prisma.orderItem.deleteMany(),
		prisma.payment.deleteMany(),
		prisma.order.deleteMany(),
		prisma.review.deleteMany(),
		prisma.productSpecification.deleteMany(),
		prisma.cartItem.deleteMany(),
		prisma.cart.deleteMany(),
		prisma.favorite.deleteMany(),
		prisma.product.deleteMany(),
		prisma.promotion.deleteMany(),
		prisma.category.deleteMany(),
		prisma.brand.deleteMany(),
		prisma.address.deleteMany(),
		prisma.user.deleteMany(),
	])

	const brands = Array.from({ length: 10 }).map((_, i) => ({
		name: faker.company.name(),
		slug: `${faker.helpers.slugify(
			faker.company.name()
		)}-${faker.string.alphanumeric(4)}`.toLowerCase(),
		logo: brandLogos[i],
		description: faker.lorem.paragraph(),
		website: faker.internet.url(),
	}))
	await prisma.brand.createMany({ data: brands })
	const createdBrands = await prisma.brand.findMany()

	const parentCategories = Array.from({ length: 5 }).map((_, i) => ({
		name: faker.commerce.department(),
		slug: `${faker.helpers.slugify(
			faker.commerce.department()
		)}-${faker.string.alphanumeric(4)}`.toLowerCase(),
		description: faker.lorem.sentence(),
		image: categoryImages[i],
		isActive: true,
	}))
	await prisma.category.createMany({ data: parentCategories })
	const createdParentCategories = await prisma.category.findMany()

	const childCategories = createdParentCategories.flatMap(parent =>
		Array.from({ length: 2 }).map(() => ({
			name: faker.commerce.productAdjective(),
			slug: `${faker.helpers.slugify(
				faker.commerce.productAdjective()
			)}-${faker.string.alphanumeric(4)}`.toLowerCase(),
			description: faker.lorem.sentence(),
			image: faker.helpers.arrayElement(categoryImages),
			parentId: parent.id,
			isActive: true,
		}))
	)
	await prisma.category.createMany({ data: childCategories })
	const allCategories = await prisma.category.findMany()

	const users = [
		{
			email: 'admin@example.com',
			password: 'password123',
			firstName: 'Admin',
			lastName: 'User',
			role: Role.ADMIN,
		},
		{
			email: 'user@example.com',
			password: 'password123',
			firstName: 'Regular',
			lastName: 'User',
			role: Role.CUSTOMER,
		},
		...Array.from({ length: 10 }).map(() => ({
			email: faker.internet.email(),
			password: faker.internet.password(),
			firstName: faker.person.firstName(),
			lastName: faker.person.lastName(),
			patronymic: faker.person.middleName(),
			phone: faker.phone.number(),
			role: Role.CUSTOMER,
		})),
	]
	await prisma.user.createMany({ data: users })
	const createdUsers = await prisma.user.findMany()

	const addresses = createdUsers.flatMap(user =>
		Array.from({ length: faker.number.int({ min: 1, max: 3 }) }).map(
			(_, i) => ({
				userId: user.id,
				country: faker.location.countryCode(),
				city: faker.location.city(),
				street: faker.location.street(),
				building: faker.location.buildingNumber(),
				apartment: faker.number.int({ min: 1, max: 100 }).toString(),
				entrance: faker.number.int({ min: 1, max: 5 }).toString(),
				postalCode: faker.location.zipCode(),
				isDefault: i === 0,
			})
		)
	)
	await prisma.address.createMany({ data: addresses })

	const products = await Promise.all(
		Array.from({ length: 30 }).map(async (_, i) => {
			const brand = faker.helpers.arrayElement(createdBrands)
			const categories = faker.helpers.arrayElements(allCategories, {
				min: 1,
				max: 3,
			})

			return prisma.product.create({
				data: {
					name: faker.commerce.productName(),
					description: faker.commerce.productDescription(),
					price: parseFloat(faker.commerce.price({ min: 10, max: 1000 })),
					oldPrice: faker.datatype.boolean({ probability: 0.3 })
						? parseFloat(faker.commerce.price({ min: 10, max: 1000 }))
						: null,
					sku: `SKU-${faker.string.alphanumeric(8).toUpperCase()}`,
					quantity: faker.number.int({ min: 0, max: 100 }),
					images: [
						productImages[i % productImages.length],
						productImages[(i + 1) % productImages.length],
						productImages[(i + 2) % productImages.length],
					],
					brandId: brand.id,
					categories: { connect: categories.map(c => ({ id: c.id })) },
					weight: faker.number.float({
						min: 0.1,
						max: 10,
						fractionDigits: 1, // Исправленный параметр
					}),
					dimensions: `${faker.number.int({
						min: 5,
						max: 50,
					})}x${faker.number.int({ min: 5, max: 50 })}x${faker.number.int({
						min: 5,
						max: 50,
					})}`,
					warrantyMonths: faker.number.int({ min: 12, max: 36 }),
					isFeatured: faker.datatype.boolean(),
					isActive: true,
					specifications: {
						create: Array.from(
							{ length: faker.number.int({ min: 1, max: 5 }) },
							() => ({
								name: faker.commerce.productMaterial(),
								value: faker.commerce.productAdjective(),
							})
						),
					},
				},
			})
		})
	)
	await Promise.all(
		products.flatMap(product =>
			Array.from({ length: faker.number.int({ min: 0, max: 10 }) }).map(
				async () => {
					const user = faker.helpers.arrayElement(
						createdUsers.filter(u => u.role === Role.CUSTOMER)
					)
					return prisma.review.create({
						data: {
							productId: product.id,
							userId: user.id,
							rating: faker.number.int({ min: 1, max: 5 }),
							comment: faker.lorem.paragraph(),
							pros: faker.lorem.words(5),
							cons: faker.lorem.words(3),
							images: [],
						},
					})
				}
			)
		)
	)

	await Promise.all(
		createdUsers.map(async user => {
			await prisma.cart.create({
				data: {
					userId: user.id,
					items: {
						create: faker.helpers
							.arrayElements(products, { min: 0, max: 5 })
							.map(product => ({
								productId: product.id,
								quantity: faker.number.int({ min: 1, max: 3 }),
							})),
					},
				},
			})

			const favorites = faker.helpers.arrayElements(products, {
				min: 0,
				max: 5,
			})
			await prisma.favorite.createMany({
				data: favorites.map(product => ({
					userId: user.id,
					productId: product.id,
				})),
			})
		})
	)

	const customers = createdUsers.filter(u => u.role === Role.CUSTOMER)
	await Promise.all(
		customers.flatMap(customer =>
			Array.from({ length: faker.number.int({ min: 0, max: 5 }) }).map(
				async () => {
					const address = await prisma.address.findFirst({
						where: { userId: customer.id },
					})
					if (!address) return

					const order = await prisma.order.create({
						data: {
							userId: customer.id,
							orderNumber: `ORD-${faker.string.nanoid(10)}`,
							status: faker.helpers.arrayElement(Object.values(OrderStatus)),
							total: 0,
							addressId: address.id,
							items: { create: [] },
						},
					})

					const orderProducts = faker.helpers.arrayElements(products, {
						min: 1,
						max: 5,
					})
					let total = 0

					await Promise.all(
						orderProducts.map(async product => {
							const quantity = faker.number.int({ min: 1, max: 3 })
							total += product.price * quantity
							return prisma.orderItem.create({
								data: {
									orderId: order.id,
									productId: product.id,
									quantity,
									price: product.price,
								},
							})
						})
					)

					await prisma.order.update({
						where: { id: order.id },
						data: { total },
					})

					await prisma.payment.create({
						data: {
							orderId: order.id,
							amount: total,
							method: faker.helpers.arrayElement(Object.values(PaymentMethod)),
							status: faker.helpers.arrayElement(Object.values(PaymentStatus)),
							transactionId: faker.string.uuid(),
						},
					})
				}
			)
		)
	)

	await Promise.all(
		Array.from({ length: 5 }).map(async () => {
			const productsToConnect = faker.helpers.arrayElements(products, {
				min: 1,
				max: 5,
			})
			const categoriesToConnect = faker.helpers.arrayElements(allCategories, {
				min: 1,
				max: 3,
			})

			return prisma.promotion.create({
				data: {
					name: `${faker.commerce.productAdjective()} Sale`,
					description: faker.lorem.sentence(),
					discount: faker.number.float({ min: 5, max: 50 }),
					code: faker.string.alphanumeric(8).toUpperCase(),
					startDate: faker.date.past(),
					endDate: faker.date.future(),
					isActive: faker.datatype.boolean(),
					products: { connect: productsToConnect.map(p => ({ id: p.id })) },
					categories: { connect: categoriesToConnect.map(c => ({ id: c.id })) },
				},
			})
		})
	)

	console.log('Успех')
}

main()
	.catch(e => {
		console.error('Ошибка ', e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})

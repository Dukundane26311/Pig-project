import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding initial data...')

  // Create super admin if it doesn't exist
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@valueprotocols.rw' }
  })

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('Admin@123', 10)
    await prisma.user.create({
      data: {
        name: 'Super Admin',
        email: 'admin@valueprotocols.rw',
        phone: '+250000000000',
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        active: true,
      }
    })
    console.log('Created SUPER_ADMIN: admin@valueprotocols.rw (password: Admin@123)')
  } else {
    console.log('SUPER_ADMIN already exists.')
  }

  console.log('Seeding completed.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

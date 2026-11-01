// Temporary script — sets admin password + role in DB directly
// Run: node scripts/set-admin.js
// Delete after use.
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const ADMIN_EMAIL    = 'admin@yourmithila.in';
const ADMIN_PASSWORD = 'YM@Admin2025';

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash(ADMIN_PASSWORD, 12);

  // Upsert: create if doesn't exist, update if does
  const existing = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });

  if (!existing) {
    console.log('No user found with that email — creating admin...');
    const user = await prisma.user.create({
      data: {
        name:       'YourMithila Admin',
        email:      ADMIN_EMAIL,
        password:   hash,
        role:       'ADMIN',
        city:       'Madhubani',
        district:   'Madhubani',
        state:      'Bihar',
        interests:  [],
        isActive:   true,
        isVerified: true,
      },
    });
    console.log('✅ Admin user CREATED — id:', user.id);
  } else {
    await prisma.user.update({
      where: { email: ADMIN_EMAIL },
      data:  { password: hash, role: 'ADMIN', isVerified: true },
    });
    console.log('✅ Admin user UPDATED — id:', existing.id, '| role set to ADMIN | password updated');
  }

  console.log('');
  console.log('Login credentials:');
  console.log('  Email    :', ADMIN_EMAIL);
  console.log('  Password :', ADMIN_PASSWORD);
  console.log('  URL      : https://yourmithila.in/admin/login');
  console.log('');
  console.log('Also works at /auth/login with the same credentials.');
}

main()
  .catch(e => { console.error('Error:', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());

const { PrismaClient } = require('../generated/prisma');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting deployment setup...');
  
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Run any necessary setup
    console.log('✅ Deployment setup completed');
  } catch (error) {
    console.error('❌ Deployment setup failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 
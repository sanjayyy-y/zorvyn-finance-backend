require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Transaction = require('./src/models/Transaction');
const connectDB = require('./src/config/db');

const importData = async () => {
  try {
    await connectDB();

    // Clear existing data (optional, but good for a fresh start)
    await User.deleteMany();
    await Transaction.deleteMany();

    // 1. Create Admin
    const adminUser = await User.create({
      name: 'Super Admin',
      email: 'admin@finance.com',
      password: 'password123',
      role: 'ADMIN',
    });

    // 2. Create Analyst
    const analystUser = await User.create({
      name: 'Data Analyst',
      email: 'analyst@finance.com',
      password: 'password123',
      role: 'ANALYST',
    });

    // 3. Create Viewer
    const viewerUser = await User.create({
      name: 'Read Viewer',
      email: 'viewer@finance.com',
      password: 'password123',
      role: 'VIEWER',
    });

    // 4. Create some MOCK transactions
    await Transaction.create([
      {
        amount: 5000,
        type: 'INCOME',
        category: 'Salary',
        date: new Date('2026-01-15'),
        notes: 'January Salary',
        createdBy: adminUser._id,
      },
      {
        amount: 1500,
        type: 'EXPENSE',
        category: 'Rent',
        date: new Date('2026-01-16'),
        notes: 'Office Rent',
        createdBy: adminUser._id,
      },
      {
        amount: 300,
        type: 'EXPENSE',
        category: 'Utilities',
        date: new Date('2026-01-20'),
        notes: 'Electricity Bill',
        createdBy: adminUser._id,
      },
      {
        amount: 2000,
        type: 'INCOME',
        category: 'Consulting',
        date: new Date('2026-02-10'),
        notes: 'Freelance work',
        createdBy: adminUser._id,
      },
      {
        amount: 400,
        type: 'EXPENSE',
        category: 'Food',
        date: new Date('2026-02-12'),
        notes: 'Catering',
        createdBy: adminUser._id,
      }
    ]);

    console.log('✅ Data Imported Successfully!');
    console.log('--- TEST ACCOUNTS ---');
    console.log('Admin: admin@finance.com / password123');
    console.log('Analyst: analyst@finance.com / password123');
    console.log('Viewer: viewer@finance.com / password123');
    process.exit();
  } catch (error) {
    console.error(`Error with data import: ${error}`);
    process.exit(1);
  }
};

importData();

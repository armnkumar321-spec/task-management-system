import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Task from '../models/Task.js';

dotenv.config();

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/taskflow';

const seedDatabase = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('[Seed] Connected to database.');

    // Clear existing collections safely
    await User.deleteMany({});
    await Task.deleteMany({});
    console.log('[Seed] Cleared existing users and tasks.');

    // Create Demo Users
    const adminPasswordHash = await User.hashPassword('Admin@123456');
    const userPasswordHash = await User.hashPassword('User@123456');

    const admin = await User.create({
      name: 'Eleanor Vance (Admin)',
      email: 'admin@taskflow.dev',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
    });

    const standardUser = await User.create({
      name: 'John Doe',
      email: 'user@taskflow.dev',
      passwordHash: userPasswordHash,
      role: 'USER',
    });

    const teamMember1 = await User.create({
      name: 'Sarah Connor',
      email: 'sarah@taskflow.dev',
      passwordHash: userPasswordHash,
      role: 'USER',
    });

    const teamMember2 = await User.create({
      name: 'Alex Rivera',
      email: 'alex@taskflow.dev',
      passwordHash: userPasswordHash,
      role: 'USER',
    });

    console.log(`[Seed] Created 4 users (1 Admin, 3 standard users).`);

    // Create Sample Tasks
    const now = new Date();
    const daysFromNow = (days) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    const sampleTasks = [
      {
        title: 'Design high-converting landing page hero section',
        description: 'Create responsive layout with interactive mockups, clear CTA buttons, and micro-interactions.',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        dueDate: daysFromNow(3),
        assignedTo: standardUser._id,
        createdBy: admin._id,
      },
      {
        title: 'Implement JWT refresh token mechanism',
        description: 'Secure token rotation logic with HTTP-only cookies to handle expired sessions gracefully.',
        status: 'TODO',
        priority: 'HIGH',
        dueDate: daysFromNow(5),
        assignedTo: teamMember1._id,
        createdBy: admin._id,
      },
      {
        title: 'Optimize MongoDB indexing for task queries',
        description: 'Add compound indexes on assignedTo and status to accelerate search and filter performance.',
        status: 'COMPLETED',
        priority: 'MEDIUM',
        dueDate: daysFromNow(-2),
        assignedTo: standardUser._id,
        createdBy: admin._id,
      },
      {
        title: 'Configure automated CI pipeline on GitHub Actions',
        description: 'Run linter, Jest unit tests, and Vite build validation on every pull request to main branch.',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        dueDate: daysFromNow(4),
        assignedTo: teamMember2._id,
        createdBy: admin._id,
      },
      {
        title: 'Refactor client state management with React Context',
        description: 'Centralize authentication state and notification alerts to reduce prop-drilling across pages.',
        status: 'COMPLETED',
        priority: 'LOW',
        dueDate: daysFromNow(-5),
        assignedTo: standardUser._id,
        createdBy: admin._id,
      },
      {
        title: 'Conduct accessibility audit for WCAG 2.1 AA compliance',
        description: 'Verify contrast ratios, keyboard navigation focus rings, and screen-reader aria labels.',
        status: 'TODO',
        priority: 'LOW',
        dueDate: daysFromNow(10),
        assignedTo: teamMember1._id,
        createdBy: admin._id,
      },
      {
        title: 'Prepare API documentation in OpenAPI / Swagger format',
        description: 'Document endpoints, request payloads, error structures, and response schemas for public consumers.',
        status: 'TODO',
        priority: 'MEDIUM',
        dueDate: daysFromNow(7),
        assignedTo: standardUser._id,
        createdBy: admin._id,
      },
      {
        title: 'Setup production health check & uptime monitoring',
        description: 'Configure ping monitors and alerts for Render backend and Vercel frontend deployments.',
        status: 'COMPLETED',
        priority: 'HIGH',
        dueDate: daysFromNow(-1),
        assignedTo: admin._id,
        createdBy: admin._id,
      },
    ];

    await Task.insertMany(sampleTasks);
    console.log(`[Seed] Inserted ${sampleTasks.length} realistic tasks.`);

    console.log('\n--- SEED SUMMARY ---');
    console.log('Admin Account:    admin@taskflow.dev  / Password: Admin@123456');
    console.log('User Account:     user@taskflow.dev   / Password: User@123456');
    console.log('Member 1 Account: sarah@taskflow.dev  / Password: User@123456');
    console.log('Member 2 Account: alex@taskflow.dev   / Password: User@123456');
    console.log('--------------------\n');

    await mongoose.disconnect();
    console.log('[Seed] Database disconnected cleanly.');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedDatabase();

/**
 * Database Connection Test Script
 * Run with: bun scripts/test-db.ts
 * 
 * This script tests read-only operations against the database.
 * It does NOT modify any data.
 */

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.prod" });

// Dynamic import after env is loaded
const { default: prisma } = await import("../lib/prisma");

async function testConnection() {
  console.log("🔌 Testing database connection...\n");

  try {
    // Test 1: Basic connection
    await prisma.$queryRaw`SELECT 1 as connected`;
    console.log("✅ Connection successful\n");

    // Test 2: Count records in each table
    console.log("📊 Record counts:");
    
    const students = await prisma.student.count();
    console.log(`   Students: ${students}`);
    
    const professors = await prisma.professor.count();
    console.log(`   Professors: ${professors}`);
    
    const organizations = await prisma.organization.count();
    console.log(`   Organizations: ${organizations}`);
    
    const opportunities = await prisma.opportunity.count();
    console.log(`   Opportunities: ${opportunities}`);
    
    const applications = await prisma.application.count();
    console.log(`   Applications: ${applications}`);
    
    const events = await prisma.event.count();
    console.log(`   Events: ${events}`);
    
    const tags = await prisma.tag.count();
    console.log(`   Tags: ${tags}`);
    
    const notifications = await prisma.notification.count();
    console.log(`   Notifications: ${notifications}`);
    
    const reports = await prisma.weeklyReport.count();
    console.log(`   Weekly Reports: ${reports}`);

    // Test 3: Verify a student can be fetched (read-only)
    if (students > 0) {
      const sampleStudent = await prisma.student.findFirst({
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          createdAt: true,
        },
      });
      console.log("\n📋 Sample student (read-only):");
      console.log(`   ID: ${sampleStudent?.id}`);
      console.log(`   Email: ${sampleStudent?.email}`);
      console.log(`   Name: ${sampleStudent?.firstName} ${sampleStudent?.lastName}`);
    }

    console.log("\n✅ All tests passed! Schema is compatible with database.\n");

  } catch (error) {
    console.error("❌ Connection failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();

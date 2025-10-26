/**
 * Fix GoogleId Index Migration Script
 * 
 * This script removes the old googleId unique index that was causing issues
 * and lets Mongoose create the new correct one.
 * 
 * Run this once: node utils/fixGoogleIdIndex.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const fixGoogleIdIndex = async () => {
  try {
    console.log('🔧 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n🔍 Checking existing indexes...');
    const indexes = await User.collection.getIndexes();
    console.log('Current indexes:', Object.keys(indexes));

    // Drop the old googleId index if it exists
    try {
      console.log('\n🗑️  Attempting to drop old googleId index...');
      await User.collection.dropIndex('googleId_1');
      console.log('✅ Dropped old googleId index');
    } catch (error) {
      if (error.code === 27) {
        console.log('ℹ️  Old index not found (already dropped or never existed)');
      } else {
        console.log('⚠️  Error dropping index:', error.message);
      }
    }

    console.log('\n🔨 Creating new indexes...');
    await User.syncIndexes();
    console.log('✅ Indexes synchronized');

    console.log('\n📊 New indexes:');
    const newIndexes = await User.collection.getIndexes();
    Object.entries(newIndexes).forEach(([name, index]) => {
      console.log(`  - ${name}:`, index.key);
    });

    console.log('\n✅ Migration complete!');
    console.log('💡 You can now sign up multiple users with email/password');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during migration:', error);
    process.exit(1);
  }
};

// Run the migration
fixGoogleIdIndex();

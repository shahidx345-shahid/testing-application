const mongoose = require('mongoose');

async function fixUserSchema() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/test';
    await mongoose.connect(mongoUri);
    
    console.log('Connected to MongoDB');
    
    // Drop the users collection to remove old schema constraints
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    const usersCollection = collections.find(c => c.name === 'users');
    
    if (usersCollection) {
      await db.dropCollection('users');
      console.log('✓ Dropped users collection');
    } else {
      console.log('✓ Users collection does not exist (new database)');
    }
    
    // Drop indexes
    try {
      await db.collection('users').dropIndexes();
      console.log('✓ Dropped all indexes');
    } catch (e) {
      console.log('✓ No indexes to drop');
    }
    
    console.log('✓ Schema fixed! Database ready for new users without phoneNumber.');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error fixing schema:', error);
    process.exit(1);
  }
}

fixUserSchema();

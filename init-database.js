require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { data: sampleListings } = require('./init/data.js');

// Import models
const Listing = require('./models/listing.js');
const User = require('./models/user.js');

async function initializeDatabase() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URL);
    console.log('✅ Connected to MongoDB successfully!');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await Listing.deleteMany({});
    await User.deleteMany({});
    console.log('✅ Cleared existing data');

    // Create a test user
    console.log('👤 Creating test user...');
    const hashedPassword = await bcrypt.hash('password123', 12);
    const testUser = new User({
      email: 'admin@wanderlust.com',
      username: 'admin',
      password: hashedPassword
    });
    await testUser.save();
    console.log('✅ Created test user: admin@wanderlust.com / password123');

    // Add sample listings
    console.log('🏠 Adding sample listings...');
    const listingsWithOwner = sampleListings.map(listing => ({
      ...listing,
      owner: testUser._id
    }));

    await Listing.insertMany(listingsWithOwner);
    console.log(`✅ Added ${sampleListings.length} sample listings`);

    // Display summary
    const totalListings = await Listing.countDocuments();
    const totalUsers = await User.countDocuments();
    
    console.log('\n📊 Database Summary:');
    console.log(`   Users: ${totalUsers}`);
    console.log(`   Listings: ${totalListings}`);
    console.log('\n🎉 Database initialization completed successfully!');
    console.log('\n🔑 Test Login Credentials:');
    console.log('   Email: admin@wanderlust.com');
    console.log('   Password: password123');

    await mongoose.connection.close();
    console.log('✅ Database connection closed');

  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
    process.exit(1);
  }
}

initializeDatabase(); 
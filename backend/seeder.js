
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const users = require('./data/users');
const products = require('./data/products');
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Coupon = require('./models/Coupon');

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const importData = async () => {
  try {
    await connectDB();

    console.log('Clearing existing data...');
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();
    await Coupon.deleteMany();

    console.log('Importing Users...');
    const createdUsers = await User.insertMany(users);
    const adminUser = createdUsers[0]._id;

    console.log('Importing Products...');
    const sampleProducts = products.map((product) => {
      return { ...product, user: adminUser };
    });

    await Product.insertMany(sampleProducts);

    console.log('Importing Coupons...');
    await Coupon.insertMany([
        { 
            code: 'WELCOME500', type: 'FLAT', value: 500, minOrderValue: 5000, 
            expiryDate: new Date('2025-12-31'), isActive: true, usageLimit: 1000 
        },
        { 
            code: 'STEEL10', type: 'PERCENTAGE', value: 10, minOrderValue: 2000, 
            maxDiscount: 2000, expiryDate: new Date('2025-12-31'), isActive: true, 
            applicableCategories: ['Almirah', 'Beds'] 
        }
    ]);

    console.log('Data Imported Successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await connectDB();
    
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();
    await Coupon.deleteMany();

    console.log('Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}

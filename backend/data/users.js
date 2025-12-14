
const bcrypt = require('bcryptjs');

const users = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'password123', // Will be hashed by the model or seeder
    role: 'ADMIN',
    avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=0D9488&color=fff',
    addresses: [],
    wishlist: []
  },
  {
    name: 'Sarah Customer',
    email: 'customer@example.com',
    password: 'password123',
    role: 'CUSTOMER',
    avatar: 'https://ui-avatars.com/api/?name=Sarah+Customer&background=random',
    addresses: [
      {
        fullName: 'Sarah Customer',
        phoneNumber: '9876543210',
        street: '123 Market Road',
        city: 'Jaipur',
        state: 'Rajasthan',
        zipCode: '302001',
        country: 'India',
        type: 'Home',
        isDefault: true
      }
    ],
    wishlist: []
  }
];

module.exports = users;

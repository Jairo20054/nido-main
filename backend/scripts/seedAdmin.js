// scripts/seedAdmin.js - Script para crear usuario admin inicial
// CREADO POR IA: 2024-10-05

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const db = require('../config/db');

const adminData = {
  name: 'Admin Nido',
  email: 'admin@nido.com',
  password: 'Admin1234',
  roles: ['admin']
};

(async () => {
  try {
    await db.connect();

    const existingAdmin = await User.findOne({ email: adminData.email });
    if (existingAdmin) {
      console.log('El usuario admin ya existe:', adminData.email);
      process.exit(0);
    }

    const adminUser = new User(adminData);
    await adminUser.save();

    console.log('Usuario admin creado exitosamente:', adminData.email);
    process.exit(0);
  } catch (error) {
    console.error('Error creando usuario admin:', error);
    process.exit(1);
  }
})();

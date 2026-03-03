const bcrypt = require('bcryptjs');
const prisma = require('../../config/prisma');
const { generateTokens } = require('../../utils/generateToken');
const { sendWelcomeEmail } = require('../../utils/emailService');

const register = async ({ email, password, firstName, lastName, phone }) => {
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    throw new Error('Email already registered');
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      createdAt: true
    }
  });

  const tokens = generateTokens(user.id);
  return { user, ...tokens };
};

const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw new Error('Invalid email or password');
  }

  if (!user.isActive) {
    throw new Error('Account has been deactivated');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  const tokens = generateTokens(user.id);

  const userWithoutPassword = {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    role: user.role,
    createdAt: user.createdAt
  };

  try { await sendWelcomeEmail(user); } catch (e) { console.log('Email error:', e.message); }
  return { user: userWithoutPassword, ...tokens };
};

const getProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      nationality: true,
      dateOfBirth: true,
      passportNumber: true,
      passportExpiry: true,
      role: true,
      createdAt: true
    }
  });

  if (!user) {
    throw new Error('User not found');
  }

  return user;
};

module.exports = { register, login, getProfile };

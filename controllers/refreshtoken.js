const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const RefreshToken = require("../models/refreshToken")
const boom = require("@hapi/boom");



// Function to generate a refresh token
const generateRefreshToken = async (userId) => {
  const token = crypto.randomBytes(40).toString('hex'); // Generate a secure random token
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 7 days from now

  // Store the refresh token in the database
  await RefreshToken.create({
    token,
    userId,
    expiresAt,
  });

  return token;
};

const validateRefreshToken = async (token) => {
  // Find the refresh token in the database
  const refreshToken = await RefreshToken.findOne({
    where: { token },
    include: [{ model: User, as : 'user' }],
  });

  if (!refreshToken) {
    throw boom.badRequest('Invalid refresh token');
  }

  // Check if the token has expired
  if (refreshToken.expiresAt < new Date()) {
    await refreshToken.destroy(); // Remove expired tokens
    throw boom.badRequest('Refresh token has expired');
  }

  return refreshToken.user; // Return the associated user
};

const refreshAccessToken = async (refreshToken) => {
  const user = await validateRefreshToken(refreshToken);

  // Generate a new access token
  const accessToken = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '15m' } // Short-lived access token
  );

  return accessToken;
};

const revokeRefreshToken = async (token) => {
  await RefreshToken.destroy({ where: { token } });
};

module.exports = {generateRefreshToken, refreshAccessToken, revokeRefreshToken}
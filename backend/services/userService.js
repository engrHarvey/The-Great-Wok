const bcrypt = require('bcrypt');

const hashPassword = async (plainPassword) => {
  try {
    const saltRounds = 10;
    return await bcrypt.hash(plainPassword, saltRounds);
  } catch (err) {
    throw new Error('Password hashing failed');
  }
};

module.exports = { hashPassword };
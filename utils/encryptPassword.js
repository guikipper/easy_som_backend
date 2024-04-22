const bcrypt = require('bcryptjs');

async function encryptPassword(password) {
    const saltRounds = 10; 
  
    try {
      const hash = await bcrypt.hash(password, saltRounds);
      return hash;
    } catch (error) {
      throw new Error('Erro ao criar o hash de senha');
    }
  }

module.exports = encryptPassword
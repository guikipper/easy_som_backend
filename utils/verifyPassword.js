const bcrypt = require("bcryptjs");

const verifyPassword = async (password, hashedPassword) => {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;
}

module.exports = verifyPassword;
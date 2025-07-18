const db = require("../config/db");

const User = {
  findByEmail: (email, callback) => {
    db.query("SELECT * FROM users WHERE email = ?", [email], callback);
  },

  create: (email, hashedPassword, role = "user", fullName = "", dob = null, callback) => {
    db.query(
      "INSERT INTO users (email, password, role, full_name, dob) VALUES (?, ?, ?, ?, ?)",
      [email, hashedPassword, role, fullName, dob],
      callback
    );
  },
};

module.exports = User;

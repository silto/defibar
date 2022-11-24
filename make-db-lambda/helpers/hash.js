const crypto = require("crypto");

module.exports.generateHash = (length = 32) => {
  return crypto.randomBytes(length).toString("hex");
};

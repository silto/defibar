const parsedAWSSecret = process.env.DB_URL_OBJ
  ? JSON.parse(process.env.DB_URL_OBJ)
  : null;
module.exports = {
  dbUrl:
    parsedAWSSecret.DEFIBAR_DATABASE_URL || process.env.DEFIBAR_DATABASE_URL,
};

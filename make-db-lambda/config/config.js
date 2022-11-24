const parsedAWSSecret = process.env.DB_URL_OBJ
  ? JSON.parse(process.env.DB_URL_OBJ)
  : null;
module.exports = {
  dbUrl:
    process.env.DEFIBAR_DATABASE_URL || parsedAWSSecret.DEFIBAR_DATABASE_URL,
};

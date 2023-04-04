module.exports = {
  dbUrl:
    process.env.DEFIBAR_DATABASE_URL_SECRET || process.env.DEFIBAR_DATABASE_URL,
};

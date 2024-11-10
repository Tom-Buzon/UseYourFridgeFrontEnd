//module.exports = {
//  HOST: "useyourfridgedb.cz8kwm66811r.eu-west-3.rds.amazonaws.com",
//  USER: "useyourfridgeAdm",
//  PASSWORD: "Admin!123",
//  DB: "useyourfridgeDB",
//  dialect: "postgres",
//  pool: {
//    max: 5,
//    min: 0,
//    acquire: 30000,
//    idle: 10000
//  }
//};

module.exports = {
  HOST: process.env.DB_HOST || "localhost",
  USER: process.env.DB_USER || "postgres",
  PASSWORD: process.env.DB_PASSWORD || "admin",
  DB: process.env.DB_NAME || "UseYourFridge",
  PORT: process.env.DB_PORT || 5432,
  dialect: "postgres",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};
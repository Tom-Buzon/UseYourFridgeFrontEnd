module.exports = {
  HOST: "useyourfridgedb.cz8kwm66811r.eu-west-3.rds.amazonaws.com",
  USER: "useyourfridgeAdm",
  PASSWORD: "Admin!123",
  DB: "useyourfridgeDB",
  dialect: "postgres",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};
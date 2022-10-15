const Sequelize = require('sequelize');
const config = require('config');

const dbConfig = config.get('database');
// console.log('dbConfig: ', dbConfig);

const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
  dialect: dbConfig.dialect,
  storage: dbConfig.storage,
  logging: false,
});

module.exports = sequelize;

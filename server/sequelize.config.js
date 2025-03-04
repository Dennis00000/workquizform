const path = require('path');
const config = require('./src/config');

module.exports = {
  development: {
    url: config.database.url,
    dialect: 'postgres',
    migrationStorageTableName: 'sequelize_migrations',
    seederStorageTableName: 'sequelize_seeds'
  },
  test: {
    url: config.database.url,
    dialect: 'postgres',
    migrationStorageTableName: 'sequelize_migrations',
    seederStorageTableName: 'sequelize_seeds'
  },
  production: {
    url: config.database.url,
    dialect: 'postgres',
    migrationStorageTableName: 'sequelize_migrations',
    seederStorageTableName: 'sequelize_seeds',
    logging: false
  }
}; 
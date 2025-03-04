const { Sequelize } = require('sequelize');
const { Umzug, SequelizeStorage } = require('umzug');
const config = require('../../config');
const { logger } = require('../../utils/logger');

// Create Sequelize instance
const sequelize = new Sequelize(config.database.url, {
  logging: msg => logger.debug(msg)
});

// Create Umzug instance for migrations
const umzug = new Umzug({
  migrations: {
    glob: 'src/db/migrations/*.js',
    resolve: ({ name, path, context }) => {
      const migration = require(path);
      return {
        name,
        up: async () => migration.up(context, Sequelize),
        down: async () => migration.down(context, Sequelize)
      };
    }
  },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger: console
});

// Run migrations
async function runMigrations() {
  try {
    logger.info('Running database migrations...');
    await umzug.up();
    logger.info('Migrations completed successfully');
    return true;
  } catch (error) {
    logger.error('Migration failed:', error);
    return false;
  }
}

module.exports = {
  runMigrations,
  sequelize
}; 
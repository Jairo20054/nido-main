const { Pool } = require('pg');
const config = require('./index');
const logger = require('../utils/logger');

const pool = new Pool({
    connectionString: config.database.postgres.uri,
});

pool.on('connect', () => {
    // logger.debug('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
    logger.error('Unexpected error on idle PostgreSQL client', err);
    process.exit(-1);
});

const query = async (text, params) => {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        // logger.debug('Executed query', { text, duration, rows: res.rowCount });
        return res;
    } catch (error) {
        logger.error('Error executing query', { text, error });
        throw error;
    }
};

const connect = async () => {
    try {
        const client = await pool.connect();
        logger.info('Successfully connected to PostgreSQL');
        client.release();
    } catch (err) {
        logger.error('Failed to connect to PostgreSQL', err);
        throw err;
    }
};

module.exports = {
    query,
    connect,
    pool,
};

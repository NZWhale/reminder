import { PoolConfig as PgConfig } from 'pg';
import * as dotenv from 'dotenv'

export interface IConfig {
    db: PgConfig;
    telegram: {
        apiKey?: string
    }
}

export default (): IConfig => {
    dotenv.config()
    return {
        telegram: {
            apiKey: process.env.BOT_TOKEN,
        },
        db: {
            host: process.env.DB_MASTER_HOST || '127.0.0.1',
            port: Number(process.env.DB_MASTER_PORT) || 5432,
            database: process.env.DB_MASTER_NAME || 'reminder',
            user: process.env.DB_MASTER_USERNAME || 'root',
            password: process.env.DB_MASTER_PASSWORD || 'password',
        },
    }
};
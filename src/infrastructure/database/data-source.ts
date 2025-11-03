import 'dotenv/config';
import { DataSource } from 'typeorm';
import path from 'path';
import { UserEntity } from '../entities/user.entity';
import { parse } from 'pg-connection-string';
import { RefreshTokenEntity } from '../entities/refresh-token.entity';

// Parse DATABASE_URL if provided, otherwise use individual env vars
function getDatabaseConfig() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (databaseUrl) {
    const config = parse(databaseUrl);
    return {
      host: config.host || 'localhost',
      port: config.port ? parseInt(config.port) : 5432,
      username: config.user || 'postgres',
      password: config.password || 'postgres',
      database: config.database || 'business-intel-core',
    };
  }

  // Fallback to individual environment variables
  return {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'postgres',
    database: process.env.DB_NAME || 'business-intel-core',
  };
}

const dbConfig = getDatabaseConfig();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: dbConfig.host,
  port: dbConfig.port,
  username: dbConfig.username,
  password: dbConfig.password,
  database: dbConfig.database,
  synchronize: true, // false for production; use migrations
  logging: false,
  entities: [UserEntity,RefreshTokenEntity],
  migrations: [path.join(__dirname, '../../migrations/*{.ts,.js}')],
});
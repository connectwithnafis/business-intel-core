import 'dotenv/config';
import { DataSource } from 'typeorm';
import path from 'path';
import { UserEntity } from '../entities/user.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'postgres',
  database: process.env.DB_NAME || 'business_intel',
  synchronize: false, // false for production; use migrations
  logging: false,
  entities: [UserEntity],
  migrations: [path.join(__dirname, '../../migrations/*{.ts,.js}')],
});

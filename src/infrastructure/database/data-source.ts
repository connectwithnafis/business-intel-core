import 'dotenv/config';
import { DataSource } from 'typeorm';
import path from 'path';
import { UserEntity } from '../entities/user.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  synchronize: false, // false for production; use migrations
  logging: false,
  entities: [UserEntity],
  migrations: [path.join(__dirname, '../../migrations/*{.ts,.js}')],
});

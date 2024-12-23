import { registerAs } from '@nestjs/config';
import { fail } from 'assert';
import { config as dotenvConfig } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';

dotenvConfig({ path: '.env.development.local' });

//DB Postgres configuration

const PostgresDataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  database: process.env.POSTGRES_DB,
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  synchronize: true,
  dropSchema: true,
  logging: ['error'],
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/migrations/*{.js,.ts}'],
};

export const postgresDataSourceConfig = registerAs(
  'postgres',
  () => PostgresDataSourceOptions,
);

export const PostgresDataSource = new DataSource(PostgresDataSourceOptions);

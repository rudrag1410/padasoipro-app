import { loadConfig } from '../../config/env';
import { openDatabase } from '../database';
import { seedCatalogue } from './seed-catalogue';

const config = loadConfig();
const db = openDatabase(config.DATABASE_PATH);
const result = seedCatalogue(db);
console.log(`Seeded ${result.categories} categories and ${result.tasks} tasks into ${config.DATABASE_PATH}`);
db.close();

import path from 'node:path';
import { Model } from 'objection';
import Knex from 'knex';

export const knex = Knex({
  client: 'sqlite3',
  useNullAsDefault: true,
  connection: {
    filename: path.join(process.cwd(), 'data/database.sqlite3'),
  },
});

Model.knex(knex);

export class User extends Model {
  id!: string;
  createdAt!: Date;
  updatedAt!: Date;
  deletedAt!: Date;
  password!: string;

  static get tableName() {
    return 'users';
  }
}

async function createUserSchema() {
  if (await knex.schema.hasTable('users')) {
    return;
  }

  await knex.schema.createTable('users', (table) => {
    table.text('id').primary();
    table.datetime('createdAt');
    table.datetime('updatedAt');
    table.datetime('deletedAt');
    table.text('password'); // <alg>:<keylen>:<salt>:<hash>
  });
}

(async () => {
  await createUserSchema();
})();

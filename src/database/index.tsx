const path = require('path');
const Datastore = require('nedb');
// import NEDB from '@types/nedb';

interface DB {
  name: string;
  //   database: { new (): typeof Datastore };
  database: any;
}

export default class Database {
  database: DB[] = [];

  constructor(databaseNames: string[], dataPath: string) {
    this.database = databaseNames.map(databaseName => {
      const file = path.join(dataPath, `${databaseName}.nedb`);
      const db: DB = {
        name: databaseName,
        database: new Datastore({ filename: file, autoload: true }),
      };
      return db;
    });
  }
  getDB(databaseName: string) {
    const db = this.database.find(db => {
      return db.name === databaseName;
    });
    if (db === undefined) throw new TypeError('database not found');

    return db;
  }

  insert(databaseName: string, data: any) {
    return new Promise(resolve => {
      const db = this.getDB(databaseName);
      db.database.insert({ createdAt: new Date(Date.now()), ...data }, () => {
        resolve(void 0);
      });
    });
  }

  find(databaseName: string, query: any) {
    return new Promise((resolve, reject) => {
      const db = this.getDB(databaseName);
      db.database
        .find(query)
        .sort({ createdAt: 1 })
        .exec((err: any, docs: any) => {
          if (err) reject(err);
          resolve(docs);
        });
    });
  }
}

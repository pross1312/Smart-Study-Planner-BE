import {PathLike} from "fs";
const fs = require("fs");
const pgp = require("pg-promise")({
    capSQL: true,
});
let QRE = pgp.errors.QueryResultError;
let qrec = pgp.errors.queryResultErrorCode;

const cn = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    user: process.env.DB_USER,
    max: 30,
};
const db = pgp(cn);


const repo = {
    initIfNotExist: async (filePath: PathLike, dropIfExist: boolean = false) => {
        let conn = null;
        try {
            const root = pgp({
                host: process.env.DB_HOST,
                port: process.env.DB_PORT,
                password: process.env.DB_PASS,
                user: process.env.DB_USER,
                max: 30,
            });
            conn = await root.connect();
            const result = await conn.query(
                `SELECT 1 FROM pg_database WHERE datname='${cn.database}'`
            );
            if (result.length == 0) {
                // no db founddb
                console.log(
                    `[INFO] No database '${cn.database}' found, create one from '${filePath}'`
                );
                await conn.any(`CREATE DATABASE ${cn.database}`);
                await conn.done();
                conn = await db.connect();
                await conn.none(
                    fs.readFileSync(filePath, { encoding: "utf-8" })
                );
                return true;
            } else if (dropIfExist) {
                console.log(`Dropping database '${cn.database}'...`);
                await conn.any(`DROP DATABASE ${cn.database}`);
                console.log(`Create new database '${cn.database}'...`);
                await conn.any(`CREATE DATABASE ${cn.database}`);
                await conn.done();
                conn = await db.connect();
                await conn.none(
                    fs.readFileSync(filePath, { encoding: "utf-8" })
                );
                return true;
            } else {
                console.log(`[INFO] Database '${cn.database}' found`);
                return false;
            }
        } catch (err) {
            throw err;
        } finally {
            if (conn) conn.done();
        }
    },

    // NOTE: func: [one, none, ...] check pg-promise connection for more information
    exec: async (func: "one" | "many" | "none" | "oneOrNone" | "manyOrNone" | "any",
                 sql: string,
                 args: Array<string> = []) => {
        if (!func || !sql) throw new Error("Missing arguments");
        let conn = null;
        try {
            conn = await db.connect();
            return await conn[func](sql, args);
        } catch (err: any) {
            if (err instanceof QRE && err.code === qrec.noData) {
                return null;
            } else {
                throw err;
            }
        } finally {
            if (conn) conn.done();
        }
    }
};
// // NOTE: func: [one, none, ...] check pg-promise connection for more information
// 
// async function add(table, keys, obj)   {
//     const sql = pgp.helpers.insert(obj, keys, table);
//     await this.exec("none", sql);
// }
// 
// async function all(tb_name)   {
//     try {
//         return await this.exec('any', `SELECT * FROM "${tb_name}"`, []);
//     } catch (err) {
//         throw err;
//     }
// }
// 
// async function remove(tb_name,condition) {
//     try{
//         return await this.exec('one', `DELETE FROM "${tb_name}" WHERE ${condition}`)
//     }
//     catch(err){
//         throw(err)
//     }
// }
// 
// async function find(tb_name, condition)  {
//     try{
//         return await this.exec('any', `SELECT * FROM "${tb_name}" WHERE ${condition}`)
//     }
//     catch(err){
//         throw(err)
//     }
// }
// async function update(tb_name, update, condition)  {
//     try{
//         return await this.exec('any', `UPDATE "${tb_name}" SET ${update}  WHERE ${condition}`)
//     }
//     catch(err){
//         throw(err)
//     }
// }
// async function getMax(tb_name, key)  {
//     try{
//         return await this.exec('one', `SELECT * from "${tb_name}" ORDER BY ${key} desc limit 1`)
//     }
//     catch(err){
//         throw(err)
//     }
// }
// async function tx(func)   {
//     await this.exec("tx", func);
// }
export { repo };

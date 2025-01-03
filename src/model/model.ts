import {debugLog} from "../log/logger";
import {repo} from "../repository/postgreSQL";

class Model<ModelType, FilterInterface, UpdateInterface> {
    table_name: string;
    constructor(table_name: string) {
        this.table_name = table_name;
    }
    async save(value: ModelType) {
        // delete value.id; // use posgresql instead
        const fields: Array<string> = Object.getOwnPropertyNames(value)
                                            .filter(prop => value[prop as keyof ModelType] !== null &&
                                                            value[prop as keyof ModelType] !== undefined &&
                                                            typeof value[prop as keyof ModelType] !== "function");
        const args: Array<string> = Array.from(fields, (field) => value[field as keyof ModelType]!.toString());
        const params: string = Array.from({length: fields.length}, (_, index: number) => index).map(i => `$${i+1}`).join(", ");
        const query: string = `INSERT INTO "${this.table_name}"(${fields.join(", ")}) VALUES(${params})`;
        debugLog(query, args);
        await repo.exec("none", query, args);
    }

    async find(info: FilterInterface): Promise<Array<ModelType>> {
        const fields: Array<string> = Object.getOwnPropertyNames(info)
                                            .filter(prop => info[prop as keyof typeof info] !== undefined);
        const condition: string = fields.map((field, index) => `${field} = $${index+1}`).join(" AND ");
        const args: Array<any> = Array.from(fields, (field) => info[field as keyof typeof info]);
        let query: string;
        if (fields.length > 0) {
            query = `SELECT * FROM "${this.table_name}" WHERE ${condition}`;
        } else {
            query = `SELECT * FROM "${this.table_name}"`;
        }
        debugLog(query, args);
        const hitories: Array<ModelType> = await repo.exec("many", query, args);
        return hitories || [];
    }

    async findOne (info: FilterInterface): Promise<ModelType | null> {
        const fields: Array<string> = Object.getOwnPropertyNames(info)
                                            .filter(prop => info[prop as keyof typeof info] !== undefined);
        const condition: string = fields.map((field, index) => `${field} = $${index+1}`).join(" AND ");
        const args: Array<any> = Array.from(fields, (field) => info[field as keyof typeof info]);

        let query: string;
        if (fields.length > 0) {
            query = `SELECT * FROM "${this.table_name}" WHERE ${condition}`;
        } else {
            query = `SELECT * FROM "${this.table_name}"`;
        }
        debugLog(query, args);
        const value: ModelType | null = await repo.exec("oneOrNone", query, args);
        return value;
    }

    async update(filter: FilterInterface, update: UpdateInterface): Promise<number> {
        const update_fields: Array<string> = Object.getOwnPropertyNames(update)
                                            .filter(prop => update[prop as keyof typeof update] !== undefined);
        if (update_fields.length == 0) {
            return 0;
        }
        let args_count = 1;
        const update_statement: string = update_fields.map((field, index) => `${field} = $${args_count++}`).join(", ");
        let args: Array<any> = Array.from(update_fields, (field) => update[field as keyof typeof update]);

        const filter_fields: Array<string> = Object.getOwnPropertyNames(filter)
                                            .filter(prop => filter[prop as keyof typeof filter] !== undefined);
        const filter_condition: string = filter_fields.map((field, index) => `${field} = $${args_count++}`).join(" AND ");
        args = args.concat(Array.from(filter_fields, (field) => filter[field as keyof typeof filter]));

        let query = `UPDATE "${this.table_name}" SET ${update_statement}`;
        if (filter_fields.length > 0) {
            query += ` WHERE ${filter_condition}`;
        }
        debugLog(query, args);
        const result = await repo.exec("result", query, args);
        debugLog(`Updated ${result.rowCount} from ${this.table_name}`);
        return result.rowCount;
    }

    async delete(filter: FilterInterface): Promise<number> {
        const fields: Array<string> = Object.getOwnPropertyNames(filter)
                                            .filter(prop => filter[prop as keyof typeof filter] !== undefined);
        if (fields.length == 0) {
            throw new Error("Attempt to delete without any condition");
        }
        const condition: string = fields.map((field, index) => `${field} = $${index+1}`).join(" AND ");
        const args: Array<any> = Array.from(fields, (field) => filter[field as keyof typeof filter]);
        let query = `DELETE FROM ${this.table_name} WHERE ${condition}`;
        debugLog(query, args);

        const result = await repo.exec("result", query, args);
        console.log("Delete result: ", result);
        return result.rowCount;
    }
}

export {Model};

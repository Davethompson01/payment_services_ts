import { deepStrictEqual } from "assert";
import database from "../../config/database_connect.ts";
import utilis from "../controller/utils.ts";

// const utils = new Utilis();

export default class dbOPS {
  public db_connection: any;
  public utils: utilis;

  constructor(util?: utilis) {
    this.utils = util || new utilis(); // optional
  }
  public async db_connect() {
    const dbInstance = database.getInstance();
    this.db_connection = await dbInstance.connect();
    return this.db_connection;
  }

  private async validateIdentifier(name: string) {
    const regex = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
    return regex.test(name);
  }

  private async validateColumns(columns: string[]) {
    if (!Array.isArray(columns) || columns.length === 0)
      return this.utils.returnData(false, "No columns provided", []);

    for (const col of columns) {
      if (!this.validateIdentifier(col))
        return this.utils.returnData(false, `Invalid column name: ${col}`, col);
    }

    return this.utils.returnData(
      true,
      "Columns validated successfully",
      columns
    );
  }

  // CREATE TABLE
  public async createTable(tableName: string, schema: string) {
    if (!this.validateIdentifier(tableName))
      return this.utils.returnData(false, "Invalid table name", tableName);

    let sql = "";

    try {
      const db = await this.db_connect();
      sql = `CREATE TABLE IF NOT EXISTS \`${tableName}\` (${schema});`;
      await db.query(sql);

      return this.utils.returnData(
        true,
        `Table '${tableName}' created successfully`,
        sql
      );
    } catch (error: any) {
      return this.utils.returnData(
        false,
        `Error creating table: ${error.message}`,
        { sql, stack: error.stack }
      );
    }
  }

  //INSERT
  public async insert(table: string, data: Record<string, any>) {
    if (!this.validateIdentifier(table)) {
      return this.utils.returnData(false, "Invalid table name", table);
    }

    const columns = Object.keys(data);
    const check = await this.validateColumns(columns);

    if (!check.success) return check;

    const values = Object.values(data);
    const placeholders = columns.map(() => "?").join(", ");

    const sql = `INSERT INTO ${table} (${columns.join(
      ","
    )}) VALUES (${placeholders})`;

    try {
      const db = await this.db_connect();
      const [result]: any = await db.query(sql, values);

      if (result.affectedRows === 0) {
        return this.utils.returnData(false, "Insert failed", result);
      }

      return this.utils.returnData(true, "Insert successful", {
        insertId: result.insertId,
        affectedRows: result.affectedRows,
      });
    } catch (error: any) {
      console.error("DB INSERT ERROR:", error);
      return this.utils.returnData(false, error.message, {});
    }
  }

  // SELECT
  public async select(
    table: string,
    columns: string[] = ["*"],
    condition?: string,
    params: any[] = [],
    limit?: number,
    offset?: number
  ) {
    if (!this.validateIdentifier(table)) {
      return this.utils.returnData(false, "Invalid table name", table);
    }

    const columnCheck = await this.validateColumns(columns);
    if (!columnCheck.success) return columnCheck;

    let sql = `SELECT ${columns.join(", ")} FROM ${table}`;

    // Add condition if provided
    if (condition) {
      sql += ` WHERE ${condition}`;
    }

    // Add pagination if provided
    const queryParams = [...params];

    // if (limit !== undefined && offset !== undefined) {
    //   sql += ` LIMIT ? OFFSET ?`;
    //   queryParams.push(limit, offset);
    // }

    if (limit !== undefined) {
      sql += " LIMIT ?";
      params.push(limit);

      if (offset !== undefined) {
        sql += " OFFSET ?";
        params.push(offset);
      }
    }

    try {
      const db = await this.db_connect();
      const [rows] = await db.query(sql, queryParams);
      return this.utils.returnData(true, "Select successful", rows);
    } catch (error: any) {
      return this.utils.returnData(
        false,
        `Select failed: ${error.message}`,
        []
      );
    }
  }

  //  DELETE
  public async delete(table: string, condition: string) {
    if (!this.validateIdentifier(table))
      return this.utils.returnData(false, "Invalid table name", table);

    if (!condition)
      return this.utils.returnData(false, "Delete condition required", {});

    const sql = `DELETE FROM ${table} WHERE ${condition}`;

    try {
      const db = await this.db_connect();
      const [result] = await db.query(sql);
      return this.utils.returnData(true, "Delete successful", result);
    } catch (error: any) {
      return this.utils.returnData(
        false,
        `Delete failed: ${error.message}`,
        {}
      );
    }
  }

  public async dropDatabase(dbName: string) {
    try {
      const db = await this.db_connect();
      await db.query(`DROP DATABASE IF EXISTS \`${dbName}\``);
      return this.utils.returnData(
        true,
        `Database '${dbName}' dropped successfully`,
        {}
      );
    } catch (error: any) {
      return this.utils.returnData(
        false,
        `Error dropping database: ${error.message}`,
        {}
      );
    }
  }

  public async exists(table: string, condition: string, params: any[] = []) {
    if (!this.validateIdentifier(table)) {
      return this.utils.returnData(false, "Invalid table name", table);
    }

    const sql = `SELECT EXISTS(SELECT 1 FROM ${table} WHERE ${condition}) AS found`;

    try {
      const db = await this.db_connect();
      const [rows]: any = await db.query(sql, params);

      const exists = rows[0].found === 1;
      return this.utils.returnData(true, "Check successful", exists);
    } catch (error: any) {
      return this.utils.returnData(
        false,
        `Exists check failed: ${error.message}`,
        false
      );
    }
  }

  // UPDATE
  public async update(
    table: string,
    data: Record<string, any>,
    condition: string,
    params: any[] = []
  ) {
    if (!this.validateIdentifier(table)) {
      return this.utils.returnData(false, "Invalid table name", table);
    }

    const columns = Object.keys(data);
    const validation = await this.validateColumns(columns);
    if (!validation.success) return validation;

    const setClause = columns.map((col) => `${col} = ?`).join(", ");
    const values = Object.values(data);

    // Combine update values + condition params
    const sqlParams = [...values, ...params];

    const sql = `UPDATE ${table} SET ${setClause} WHERE ${condition}`;

    try {
      const db = await this.db_connect();

      await db.beginTransaction();

      const [result]: any = await db.query(sql, sqlParams);

      // Commit transaction for atomicity
      await db.commit();

      if (result.affectedRows > 0) {
        return this.utils.returnData(true, "Update successful", {
          affectedRows: result.affectedRows,
          changedRows: result.changedRows,
        });
      } else {
        return this.utils.returnData(false, "No rows were updated", result);
      }
    } catch (error: any) {
      // Rollback in case of failure
      try {
        const db = await this.db_connect();
        await db.rollback();
      } catch {}
      return this.utils.returnData(
        false,
        `Update failed: ${error.message}`,
        {}
      );
    }
  }

  public async selectRandom(
    table: string,
    columns: string[] = ["*"],
    limit: number = 1,
    idColumn: string = "id"
  ) {
    if (!this.validateIdentifier(table)) {
      return this.utils.returnData(false, "Invalid table name", table);
    }

    if (!this.validateIdentifier(idColumn)) {
      return this.utils.returnData(false, "Invalid ID column name", idColumn);
    }

    const columnCheck = await this.validateColumns(columns);
    if (!columnCheck.success) return columnCheck;

    let sql = "";
    try {
      const db = await this.db_connect();

      // Get min and max ID — uses index, very fast even with millions of rows
      const [rangeResult]: any = await db.query(
        `SELECT MIN(${idColumn}) AS minId, MAX(${idColumn}) AS maxId FROM \`${table}\``
      );

      const minId = rangeResult[0].minId;
      const maxId = rangeResult[0].maxId;

      if (minId === null || maxId === null) {
        return this.utils.returnData(false, `Table '${table}' has no data`, []);
      }

      //  Generate a random ID between min and max
      const randomId = Math.floor(Math.random() * (maxId - minId + 1)) + minId;

      // Select starting from that random ID
      sql = `SELECT ${columns.join(
        ", "
      )} FROM \`${table}\` WHERE ${idColumn} >= ? LIMIT ?`;
      let [rows]: any = await db.query(sql, [randomId, limit]);

      // Fallback if we didn't get enough rows
      if (rows.length < limit) {
        sql = `SELECT ${columns.join(
          ", "
        )} FROM \`${table}\` WHERE ${idColumn} < ? ORDER BY ${idColumn} DESC LIMIT ?`;
        const [fallbackRows]: any = await db.query(sql, [randomId, limit]);
        rows = [...rows, ...fallbackRows].slice(0, limit);
      }

      return this.utils.returnData(
        true,
        `Random record(s) from '${table}'`,
        rows
      );
    } catch (error: any) {
      return this.utils.returnData(
        false,
        `Random select failed: ${error.message}`,
        { sql, stack: error.stack }
      );
    }
  }
}

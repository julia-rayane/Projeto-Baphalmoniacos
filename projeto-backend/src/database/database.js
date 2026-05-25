import sqlite3 from "sqlite3";
import { open } from "sqlite";

export async function conectarBanco() {
    const db = await open({
        filename: "./src/database/baphalmoniacos.db",
        driver: sqlite3.Database
    });

    return db;
}

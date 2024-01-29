import fs from 'node:fs/promises';

const databasePath = new URL('../db.json', import.meta.url);

export class Database {
    #database = {}

    constructor() {
        this.readDatabase();
    }

    async readDatabase() {
        try {
            const data = await fs.readFile(databasePath, 'utf8');
            this.#database = JSON.parse(data);
        } catch (error) {
            // Handle the error, e.g., initialize with an empty database
            console.error('Error reading database:', error);
            this.#database = {};
            this.#persist(); // Create the file if it doesn't exist
        }
    }

    async #persist() {
        try {
            await fs.writeFile(databasePath, JSON.stringify(this.#database, null, 2), 'utf8');
        } catch (error) {
            // Handle the error
            console.error('Error writing to database:', error);
        }
    }

    select(table, search) {
        let data = this.#database[table] ?? [];
        if(search){
            data = data.filter(row => {
                return Object.entries(search).some(([key, value]) => {
                    return row[key].toLowerCase().includes(value.toLowerCase());
                })
            });
        }
        return data;
    }

    insert(table, data) {
        if (Array.isArray(this.#database[table])) {
            this.#database[table].push(data);
        } else {
            this.#database[table] = [data];
        }
        this.#persist(); // Call persist after making changes
        return data;
    }

    update(table, id, data){
        const rowIndex = this.#database[table].findIndex(row => row.id === id);
        if(rowIndex > -1){
            this.#database[table][rowIndex] = { id, ...data };
            this.#persist();
        }
    }

    delete(table, id){
        const rowIndex = this.#database[table].findIndex(row => row.id === id);
        if(rowIndex > -1){
            this.#database[table].splice(rowIndex, 1);
            this.#persist();
        }
    }
}
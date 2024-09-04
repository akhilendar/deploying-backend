const express = require("express");
const { open } = require("sqlite");
const path = require("path");
const sqlite3 = require("sqlite3");
const cors = require("cors");

//const format = require("date-fns/format");
let db;
const app = express();
app.use(express.json());
app.use(cors());

const initializeDBandServer = async () => {
    try {
        db = await open({
            filename: path.join(__dirname, "todo.db"),
            driver: sqlite3.Database,
        });
        app.listen(3000, () => {
            console.log("Server is running on http://localhost:3000/");
        });
    } catch (error) {
        console.log(`Database error is ${error.message}`);
        process.exit(1);
    }
};

initializeDBandServer();

// POST /api/todos - Create a new todo

app.post("/api/todos", async (req, res) => {
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ error: "Name is required" });
    }

    try {
        const result = await db.run("INSERT INTO todos (name) VALUES (?)", [
            name,
        ]);
        res.json({
            id: result.lastID,
            name,
            isDone: false,
            createdAt: new Date().toISOString(),
        });
    } catch (error) {
        console.error("Error creating todo:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// GET /api/todos - Retrieve all todos

app.get("/api/todos", async (req, res) => {
    try {
        const todos = await db.all("SELECT * FROM todos");
        res.json(todos);
    } catch (error) {
        console.error("Error retrieving todos:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// DELETE /api/todos/:id - Delete a todo by ID

app.delete("/api/todos/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const result = await db.run("DELETE FROM todos WHERE id = ?", [id]);
        if (result.changes === 0) {
            res.status(404).json({ error: "Todo not found" });
        } else {
            res.json({ message: "Todo deleted successfully" });
        }
    } catch (error) {
        console.error("Error deleting todo:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

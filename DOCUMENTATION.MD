# Documentation

## Third-Party Code
- **next**: React framework used for building both frontend UI and local API endpoints.
- **sqlite3**: Standard SQLite3 driver for Node.js used for local data persistence.
- **date-fns**: Modern JavaScript date utility library used for managing date comparisons.
- **jest / ts-node**: Testing framework and TypeScript runner to execute unit/integration tests.

## Database Design
The application uses a single local file-based SQLite database (`todo.db`) containing one primary table:

### Table: `tasks`
- `id` (INTEGER, Primary Key, Auto-increment)
- `title` (TEXT, Not Null) — Short title of the task.
- `description` (TEXT) — Detailed notes about the task.
- `due_date` (TEXT, Not Null) — Target completion date (YYYY-MM-DD).
- `topic` (TEXT, Not Null) — Category or topic grouping.
- `status` (TEXT, Not Null) — Fixed lifecycle stage: `Todo`, `In-Progress`, or `Complete`.
- `is_archived` (INTEGER, Not Null, Default `0`) — Soft-delete flag (`0` for active, `1` for archived).
- `created_at` (DATETIME) — Timestamp when the record was created.

## Running It
- **Node Version**: Node.js v18+ or higher.

### Exact Commands:
1. Clone or download the repository, then navigate into the folder:
   ```bash
   cd nextjs-todo-sqlite
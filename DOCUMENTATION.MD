# Documentation

## Third-Party Code
- **next**: Web framework used for building the React frontend interface and local API routes.
- **sqlite3**: Driver library used to interface Node.js directly with the local file-based SQLite database.
- **jest**: Testing framework used to run automated unit and database behavioral tests.
- **ts-node**: TypeScript execution engine used to allow Jest to execute `.ts` test files directly.

## Database Design
The application operates local-first on a single machine without user accounts, utilizing a local SQLite database (`todo.db`).

### Schema: `tasks`
Since this is a single-user application, there are no relational tables or foreign key mappings needed.

| Column       | Type     | Constraints                                         | Description                                           |
| :----------- | :------- | :-------------------------------------------------- | :---------------------------------------------------- |
| `id`         | INTEGER  | PRIMARY KEY AUTOINCREMENT                           | Unique identifier for each task record.               |
| `title`      | TEXT     | NOT NULL                                            | Brief name or title of the task.                      |
| `description`| TEXT     | NULLABLE                                            | Optional detailed description/notes for the task.     |
| `due_date`   | TEXT     | NOT NULL                                            | Targeted completion date stored in `YYYY-MM-DD` format.|
| `topic`      | TEXT     | NOT NULL                                            | Category tag used for grouping and sorting tasks.     |
| `status`     | TEXT     | CHECK(status IN ('Todo', 'In-Progress', 'Complete'))| Fixed lifecycle state constraint.                     |
| `is_archived`| INTEGER  | NOT NULL DEFAULT 0                                  | Soft-delete flag (`0` = Active, `1` = Archived).      |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP                           | Automated creation timestamp.                         |

---

## Running It

### Prerequisites
- **Node.js**: `v18.x` or higher
- **npm**: `v9.x` or higher

### Exact Commands from Clean Clone:

1. **Clone and navigate to repository**:
   ```bash
   git clone <your-repository-url>
   cd nextjs-todo-sqlite
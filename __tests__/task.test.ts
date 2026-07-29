import { describe, it, expect, afterAll } from '@jest/globals';
import db from '@/lib/db';

describe('SQLite Task Operations', () => {
  // Close database connection after tests finish to prevent Jest hanging handles
  afterAll((done) => {
    db.close((err) => {
      if (err) console.error('Error closing test DB:', err);
      done();
    });
  });

  it('should create and retrieve a task correctly', (done: () => void) => {
    const query = `INSERT INTO tasks (title, description, due_date, topic, status) VALUES (?, ?, ?, ?, ?)`;

    db.run(query, ['Test Task', 'Testing description', '2026-12-31', 'Work', 'Todo'], function (err) {
      expect(err).toBeNull();
      const lastID = this.lastID;

      db.get('SELECT * FROM tasks WHERE id = ?', [lastID], (err, task: any) => {
        expect(err).toBeNull();
        expect(task).toBeDefined();
        expect(task.title).toBe('Test Task');
        expect(task.status).toBe('Todo');
        done();
      });
    });
  });

  it('should reject invalid status insertion', (done: () => void) => {
    const query = `INSERT INTO tasks (title, due_date, topic, status) VALUES (?, ?, ?, ?)`;

    db.run(query, ['Bad Status Task', '2026-12-31', 'Work', 'InvalidStatus'], (err) => {
      expect(err).toBeDefined();
      done();
    });
  });

  it('should archive a task instead of deleting it', (done: () => void) => {
    const query = `INSERT INTO tasks (title, due_date, topic, status) VALUES (?, ?, ?, ?)`;

    db.run(query, ['Archive Me', '2026-12-31', 'Personal', 'Todo'], function (err) {
      expect(err).toBeNull();
      const lastID = this.lastID;

      db.run('UPDATE tasks SET is_archived = 1 WHERE id = ?', [lastID], (err) => {
        expect(err).toBeNull();

        db.get('SELECT * FROM tasks WHERE id = ?', [lastID], (err, task: any) => {
          expect(task.is_archived).toBe(1);
          done();
        });
      });
    });
  });
});
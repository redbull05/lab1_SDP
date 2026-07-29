import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  return new Promise((resolve) => {
    db.all('SELECT * FROM tasks ORDER BY due_date ASC', [], (err, rows) => {
      if (err) {
        resolve(NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 }));
      } else {
        resolve(NextResponse.json(rows));
      }
    });
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { title, description, due_date, topic, status } = body;

  return new Promise((resolve) => {
    const query = `INSERT INTO tasks (title, description, due_date, topic, status) VALUES (?, ?, ?, ?, ?)`;
    db.run(query, [title, description || '', due_date, topic, status || 'Todo'], function (err) {
      if (err) {
        resolve(NextResponse.json({ error: 'Failed to create task' }, { status: 500 }));
      } else {
        db.get('SELECT * FROM tasks WHERE id = ?', [this.lastID], (err, row) => {
          resolve(NextResponse.json(row, { status: 201 }));
        });
      }
    });
  });
}
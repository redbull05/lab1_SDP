import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = await params;
  const body = await request.json();
  const { title, description, due_date, topic, status, is_archived } = body;

  return new Promise((resolve) => {
    const query = `
      UPDATE tasks 
      SET title = ?, description = ?, due_date = ?, topic = ?, status = ?, is_archived = ?
      WHERE id = ?
    `;
    
    const paramsList = [
      title, 
      description || '', 
      due_date, 
      topic, 
      status, 
      is_archived ? 1 : 0, 
      id
    ];

    db.run(query, paramsList, function (err) {
      if (err) {
        resolve(NextResponse.json({ error: 'Failed to update task' }, { status: 500 }));
      } else {
        db.get('SELECT * FROM tasks WHERE id = ?', [id], (err, row) => {
          if (err) {
            resolve(NextResponse.json({ error: 'Failed to fetch updated task' }, { status: 500 }));
          } else {
            resolve(NextResponse.json({id, ...body}));
          }
        });
      }
    });
  });
}
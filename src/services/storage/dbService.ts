// src/services/storage/dbService.ts
import Dexie from 'dexie';
import type { Board } from '../../store/boardStore';

export class WhiteboardDatabase extends Dexie {
  boards: Dexie.Table<Board, string>;

  constructor() {
    super('WhiteboardDB');
    this.version(1).stores({
      boards: 'id, name, createdAt, updatedAt',
    });
    this.boards = this.table('boards');
  }
}

export const db = new WhiteboardDatabase();

export const saveBoard = async (board: Board): Promise<void> => {
  try {
    await db.boards.put(board);
  } catch (error) {
    console.error('Error saving board:', error);
  }
};

export const getBoard = async (id: string): Promise<Board | undefined> => {
  try {
    return await db.boards.get(id);
  } catch (error) {
    console.error('Error fetching board:', error);
    return undefined;
  }
};

export const getAllBoards = async (): Promise<Board[]> => {
  try {
    return await db.boards.toArray();
  } catch (error) {
    console.error('Error fetching all boards:', error);
    return [];
  }
};

export const deleteBoard = async (id: string): Promise<void> => {
  try {
    await db.boards.delete(id);
  } catch (error) {
    console.error('Error deleting board:', error);
  }
};
// src/services/storage/dbService.ts
// Storage service using localStorage to avoid external DB dependencies.
import type { Board } from '../../store/boardStore';

const BOARDS_KEY = 'whiteboard.boards';

const readAll = (): Board[] => {
  try {
    const raw = localStorage.getItem(BOARDS_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw) as Board[];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

const writeAll = (boards: Board[]) => {
  try {
    localStorage.setItem(BOARDS_KEY, JSON.stringify(boards));
  } catch (error) {
    console.error('Error writing boards:', error);
  }
};

export const saveBoard = async (board: Board): Promise<void> => {
  const boards = readAll();
  const idx = boards.findIndex(b => b.id === board.id);
  if (idx >= 0) boards[idx] = board; else boards.push(board);
  writeAll(boards);
};

export const getBoard = async (id: string): Promise<Board | undefined> => {
  return readAll().find(b => b.id === id);
};

export const getAllBoards = async (): Promise<Board[]> => {
  return readAll();
};

export const deleteBoard = async (id: string): Promise<void> => {
  const boards = readAll().filter(b => b.id !== id);
  writeAll(boards);
};
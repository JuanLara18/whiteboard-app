// src/store/boardStore.ts
import create from 'zustand';
import { persist } from 'zustand/middleware';
import create from 'zustand';
import { db, saveBoard, deleteBoard as deleteFromDB } from '../services/storage/dbService';


export interface Board {
  id: string;
  name: string;
  elements: Array<StickyNote | DrawingElement | TextElement>;
  createdAt: number;
  updatedAt: number;
}

export interface StickyNote {
  id: string;
  type: 'sticky-note';
  content: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  color: string;
  zIndex: number;
}

export interface DrawingElement {
  id: string;
  type: 'drawing';
  tool: 'pen' | 'line' | 'arrow' | 'rectangle' | 'ellipse';
  points: number[];
  strokeWidth: number;
  stroke: string;
  zIndex: number;
}

export interface TextElement {
  id: string;
  type: 'text';
  content: string;
  position: { x: number; y: number };
  fontSize: number;
  fontFamily: string;
  fill: string;
  zIndex: number;
}

interface BoardState {
  boards: Board[];
  activeBoard: string | null;
  setActiveBoard: (boardId: string) => void;
  createBoard: (name: string) => Promise<void>;
  deleteBoard: (boardId: string) => Promise<void>;
  renameBoard: (boardId: string, newName: string) => void;
  addElement: (boardId: string, element: StickyNote | DrawingElement | TextElement) => void;
  updateElement: (boardId: string, element: StickyNote | DrawingElement | TextElement) => void;
  deleteElement: (boardId: string, elementId: string) => void;
}

export const useBoardStore = create<BoardState>()((set, get) => ({
    boards: [],
    activeBoard: null,
    
    setActiveBoard: (boardId) => set({ activeBoard: boardId }),
    
    createBoard: async (name) => {
      const newBoard: Board = {
        id: Date.now().toString(),
        name,
        elements: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      
      await saveBoard(newBoard);
      
      set((state) => ({
        boards: [...state.boards, newBoard],
        activeBoard: newBoard.id,
      }));
    },
    
    deleteBoard: async (boardId) => {
      await deleteFromDB(boardId);
      
      set((state) => ({
        boards: state.boards.filter((board) => board.id !== boardId),
        activeBoard: state.activeBoard === boardId 
          ? (state.boards.length > 1 
            ? state.boards.find(b => b.id !== boardId)?.id || null 
            : null) 
          : state.activeBoard,
      }));
    },
      
      renameBoard: (boardId, newName) => {
        set((state) => ({
          boards: state.boards.map((board) =>
            board.id === boardId
              ? { ...board, name: newName, updatedAt: Date.now() }
              : board
          ),
        }));
      },
      
      addElement: (boardId, element) => {
        set((state) => ({
          boards: state.boards.map((board) =>
            board.id === boardId
              ? {
                  ...board,
                  elements: [...board.elements, element],
                  updatedAt: Date.now(),
                }
              : board
          ),
        }));
      },
      
      updateElement: (boardId, updatedElement) => {
        set((state) => ({
          boards: state.boards.map((board) =>
            board.id === boardId
              ? {
                  ...board,
                  elements: board.elements.map((element) =>
                    element.id === updatedElement.id ? updatedElement : element
                  ),
                  updatedAt: Date.now(),
                }
              : board
          ),
        }));
      },
      
      deleteElement: (boardId, elementId) => {
        set((state) => ({
          boards: state.boards.map((board) =>
            board.id === boardId
              ? {
                  ...board,
                  elements: board.elements.filter((element) => element.id !== elementId),
                  updatedAt: Date.now(),
                }
              : board
          ),
        }));
      },
    }),
    {
      name: 'whiteboard-storage',
    }
  )
);
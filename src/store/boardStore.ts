// src/store/boardStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { saveBoard, deleteBoard as deleteFromDB, getAllBoards } from '../services/storage/dbService';

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

export type BoardElement = StickyNote | DrawingElement | TextElement;

interface BoardState {
  boards: Board[];
  activeBoard: string | null;
  selectedElements: string[];
  currentTool: string;
  
  // Board actions
  loadBoards: () => Promise<void>;
  setActiveBoard: (boardId: string) => void;
  createBoard: (name: string) => Promise<void>;
  deleteBoard: (boardId: string) => Promise<void>;
  renameBoard: (boardId: string, newName: string) => Promise<void>;
  
  // Element actions
  addElement: (boardId: string, element: BoardElement) => Promise<void>;
  updateElement: (boardId: string, element: BoardElement) => Promise<void>;
  deleteElement: (boardId: string, elementId: string) => Promise<void>;
  
  // Selection actions
  setSelectedElements: (elementIds: string[]) => void;
  clearSelection: () => void;
  
  // Tool actions
  setCurrentTool: (tool: string) => void;
}

export const useBoardStore = (create as any)(
  persist(
  (set: any, get: () => BoardState) => ({
      boards: [],
      activeBoard: null,
      selectedElements: [],
      currentTool: 'select',
      
      loadBoards: async () => {
        try {
          const loadedBoards = await getAllBoards();
          set({ 
            boards: loadedBoards,
            activeBoard: loadedBoards.length > 0 && !get().activeBoard 
              ? loadedBoards[0].id 
              : get().activeBoard
          });
        } catch (error) {
          console.error('Error loading boards:', error);
        }
      },
      
  setActiveBoard: (boardId: string) => {
        set({ activeBoard: boardId, selectedElements: [] });
      },
      
  createBoard: async (name: string) => {
        const newBoard: Board = {
          id: `board_${Date.now()}`,
          name,
          elements: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        
        try {
          await saveBoard(newBoard);
          set((state: BoardState) => ({
            boards: [...state.boards, newBoard],
            activeBoard: newBoard.id,
          }));
        } catch (error) {
          console.error('Error creating board:', error);
        }
      },
      
  deleteBoard: async (boardId: string) => {
        try {
          await deleteFromDB(boardId);
          set((state: BoardState) => {
            const remainingBoards = state.boards.filter((board: Board) => board.id !== boardId);
            return {
              boards: remainingBoards,
              activeBoard: state.activeBoard === boardId 
                ? (remainingBoards.length > 0 ? remainingBoards[0].id : null)
                : state.activeBoard,
              selectedElements: [],
            };
          });
        } catch (error) {
          console.error('Error deleting board:', error);
        }
      },
      
      renameBoard: async (boardId: string, newName: string) => {
        set((state: BoardState) => {
          const updatedBoards = state.boards.map((board: Board) =>
            board.id === boardId
              ? { ...board, name: newName, updatedAt: Date.now() }
              : board
          );
          
          // Save to DB
          const updatedBoard = updatedBoards.find((b: Board) => b.id === boardId);
          if (updatedBoard) {
            saveBoard(updatedBoard).catch(console.error);
          }
          
          return { boards: updatedBoards };
        });
      },
      
      addElement: async (boardId: string, element: BoardElement) => {
        set((state: BoardState) => {
          const updatedBoards = state.boards.map((board: Board) =>
            board.id === boardId
              ? {
                  ...board,
                  elements: [...board.elements, element],
                  updatedAt: Date.now(),
                }
              : board
          );
          
          // Save to DB
          const updatedBoard = updatedBoards.find((b: Board) => b.id === boardId);
          if (updatedBoard) {
            saveBoard(updatedBoard).catch(console.error);
          }
          
          return { boards: updatedBoards };
        });
      },
      
      updateElement: async (boardId: string, updatedElement: BoardElement) => {
        set((state: BoardState) => {
          const updatedBoards = state.boards.map((board: Board) =>
            board.id === boardId
              ? {
                  ...board,
                  elements: board.elements.map((element: BoardElement) =>
                    element.id === updatedElement.id ? updatedElement : element
                  ),
                  updatedAt: Date.now(),
                }
              : board
          );
          
          // Save to DB
          const updatedBoard = updatedBoards.find((b: Board) => b.id === boardId);
          if (updatedBoard) {
            saveBoard(updatedBoard).catch(console.error);
          }
          
          return { boards: updatedBoards };
        });
      },
      
      deleteElement: async (boardId: string, elementId: string) => {
        set((state: BoardState) => {
          const updatedBoards = state.boards.map((board: Board) =>
            board.id === boardId
              ? {
                  ...board,
                  elements: board.elements.filter((element: BoardElement) => element.id !== elementId),
                  updatedAt: Date.now(),
                }
              : board
          );
          
          // Save to DB
          const updatedBoard = updatedBoards.find((b: Board) => b.id === boardId);
          if (updatedBoard) {
            saveBoard(updatedBoard).catch(console.error);
          }
          
          return { 
            boards: updatedBoards,
    selectedElements: state.selectedElements.filter((id: string) => id !== elementId)
          };
        });
      },
      
  setSelectedElements: (elementIds: string[]) => {
        set({ selectedElements: elementIds });
      },
      
      clearSelection: () => {
        set({ selectedElements: [] });
      },
      
  setCurrentTool: (tool: string) => {
        set({ currentTool: tool, selectedElements: [] });
      },
    }),
    {
      name: 'whiteboard-storage',
  partialize: (state: BoardState) => ({ 
        activeBoard: state.activeBoard,
        currentTool: state.currentTool 
      }),
    }
  )
);
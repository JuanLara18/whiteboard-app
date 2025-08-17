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

interface BoardStore {
  // Board management
  boards: Board[];
  currentBoardId: string | null;
  loadBoards: () => Promise<void>;
  createBoard: (name: string) => void;
  selectBoard: (id: string) => void;
  updateBoard: (id: string, updates: Partial<Board>) => void;
  deleteBoard: (id: string) => void;
  renameBoard: (id: string, name: string) => void;
  
  // Element management
  selectedElements: string[];
  setSelectedElements: (elementIds: string[]) => void;
  clearSelection: () => void;
  addElement: (boardId: string, element: BoardElement) => void;
  updateElement: (boardId: string, elementId: string, updates: Partial<BoardElement>) => void;
  deleteElement: (boardId: string, elementId: string) => void;
  deleteSelectedElements: (boardId: string) => void;
  
  // Tool state
  currentTool: 'select' | 'pan' | 'sticky-note';
  setCurrentTool: (tool: 'select' | 'pan' | 'sticky-note') => void;
  
  // Zoom state
  zoomLevel: number;
  setZoom: (level: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
}

export const useBoardStore = (create as any)(
  persist(
  (set: any, get: () => BoardStore) => ({
      boards: [],
      currentBoardId: null,
      selectedElements: [],
      currentTool: 'select',
      zoomLevel: 1,
      
      loadBoards: async () => {
        try {
          const loadedBoards = await getAllBoards();
          set({ 
            boards: loadedBoards,
            currentBoardId: loadedBoards.length > 0 && !get().currentBoardId 
              ? loadedBoards[0].id 
              : get().currentBoardId
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
          set((state: BoardStore) => ({
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
          set((state: BoardStore) => {
            const remainingBoards = state.boards.filter((board: Board) => board.id !== boardId);
            return {
              boards: remainingBoards,
              currentBoardId: state.currentBoardId === boardId 
                ? (remainingBoards.length > 0 ? remainingBoards[0].id : null)
                : state.currentBoardId,
              selectedElements: [],
            };
          });
        } catch (error) {
          console.error('Error deleting board:', error);
        }
      },
      
      renameBoard: async (boardId: string, newName: string) => {
        set((state: BoardStore) => {
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
        set((state: BoardStore) => {
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
        set((state: BoardStore) => {
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
        set((state: BoardStore) => {
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
      
      // Zoom functionality
      setZoom: (level: number) => {
        const clampedLevel = Math.max(0.1, Math.min(5, level));
        set({ zoomLevel: clampedLevel });
      },

      zoomIn: () => {
        const { zoomLevel, setZoom } = get();
        setZoom(zoomLevel * 1.2);
      },

      zoomOut: () => {
        const { zoomLevel, setZoom } = get();
        setZoom(zoomLevel / 1.2);
      },

      resetZoom: () => {
        set({ zoomLevel: 1 });
      },
    }),
    {
      name: 'whiteboard-storage',
  partialize: (state: BoardStore) => ({ 
        boards: state.boards,
        currentBoardId: state.currentBoardId,
        currentTool: state.currentTool,
        zoomLevel: state.zoomLevel
      }),
    }
  )
);
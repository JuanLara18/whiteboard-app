// src/store/boardStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { saveBoard, deleteBoard as deleteFromDB, getAllBoards } from '../services/storage/dbService';
import { getDefaultTemplate } from '../constants/boardTemplates';

export interface Board {
  id: string;
  name: string;
  elements: Array<StickyNote | DrawingElement | TextElement>;
  template: BoardTemplate;
  createdAt: number;
  updatedAt: number;
}

export interface BoardTemplate {
  id: string;
  name: string;
  background: {
    type: 'solid' | 'grid' | 'dots' | 'lines';
    color: string;
    gridSize?: number;
    gridColor?: string;
    opacity?: number;
  };
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
  createBoard: (name: string, template?: BoardTemplate) => void;
  selectBoard: (id: string) => void;
  updateBoard: (id: string, updates: Partial<Board>) => void;
  deleteBoard: (id: string) => void;
  renameBoard: (id: string, name: string) => void;
  
  // Element management
  selectedElements: string[];
  setSelectedElements: (elementIds: string[]) => void;
  clearSelection: () => void;
  addElement: (boardId: string, element: BoardElement) => void;
  updateElement: (
    boardId: string,
    element: BoardElement | string,
    updates?: Partial<BoardElement>
  ) => void;
  deleteElement: (boardId: string, elementId: string) => void;
  deleteSelectedElements: (boardId: string) => void;
  
  // Tool state
  currentTool: 'select' | 'pan' | 'sticky-note' | 'pen';
  setCurrentTool: (tool: 'select' | 'pan' | 'sticky-note' | 'pen') => void;
  
  // Zoom state
  zoomLevel: number;
  setZoom: (level: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;

  // Drawing settings
  penColor: string;
  penWidth: number;
  setPenColor: (color: string) => void;
  setPenWidth: (width: number) => void;
  smoothing: number; // moving average window
  simplify: boolean; // apply RDP simplification
  setSmoothing: (n: number) => void;
  setSimplify: (v: boolean) => void;
}

export const useBoardStore = (create as any)(
  persist(
  (set: any, get: () => BoardStore) => ({
      boards: [],
      currentBoardId: null,
      selectedElements: [],
      currentTool: 'select',
      zoomLevel: 1,
  penColor: '#111827', // gray[900]
  penWidth: 2,
  smoothing: 3,
  simplify: true,
      
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
      
      selectBoard: (boardId: string) => {
        set({ currentBoardId: boardId, selectedElements: [] });
      },
      
      createBoard: async (name: string, template?: BoardTemplate) => {
        const newBoard: Board = {
          id: `board_${Date.now()}`,
          name,
          elements: [],
          template: template || getDefaultTemplate(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        
        try {
          await saveBoard(newBoard);
          set((state: BoardStore) => ({
            boards: [...state.boards, newBoard],
            currentBoardId: newBoard.id,
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
      
      updateElement: async (boardId: string, element: BoardElement | string, updates?: Partial<BoardElement>) => {
        set((state: BoardStore) => {
          const isPartial = typeof element === 'string';
          const elementId = isPartial ? element : (element as BoardElement).id;
          const updatedBoards = state.boards.map((board: Board) =>
            board.id === boardId
              ? {
                  ...board,
                  elements: board.elements.map((el: BoardElement) => {
                    if (el.id !== elementId) return el;
                    if (isPartial) {
                      return { ...el, ...(updates as Partial<BoardElement>) } as BoardElement;
                    }
                    return element as BoardElement;
                  }),
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

      // Drawing settings actions
      setPenColor: (color: string) => set({ penColor: color }),
      setPenWidth: (width: number) => set({ penWidth: Math.max(1, Math.min(20, width)) }),
      setSmoothing: (n: number) => set({ smoothing: Math.max(1, Math.min(15, Math.round(n))) }),
      setSimplify: (v: boolean) => set({ simplify: v }),
    }),
    {
      name: 'whiteboard-storage',
  partialize: (state: BoardStore) => ({ 
        boards: state.boards,
        currentBoardId: state.currentBoardId,
        currentTool: state.currentTool,
        zoomLevel: state.zoomLevel,
        penColor: state.penColor,
        penWidth: state.penWidth,
        smoothing: state.smoothing,
        simplify: state.simplify,
      }),
    }
  )
);
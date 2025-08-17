// src/constants/boardTemplates.ts
import type { BoardTemplate } from '../store/boardStore';

export const BOARD_TEMPLATES: BoardTemplate[] = [
  {
    id: 'blank-white',
    name: 'Blank White',
    background: {
      type: 'solid',
      color: '#ffffff',
    },
  },
  {
    id: 'grid-small',
    name: 'Small Grid',
    background: {
      type: 'grid',
      color: '#ffffff',
      gridSize: 20,
      gridColor: '#e5e7eb',
      opacity: 0.8,
    },
  },
  {
    id: 'grid-medium',
    name: 'Medium Grid',
    background: {
      type: 'grid',
      color: '#ffffff',
      gridSize: 40,
      gridColor: '#d1d5db',
      opacity: 0.7,
    },
  },
  {
    id: 'grid-large',
    name: 'Large Grid',
    background: {
      type: 'grid',
      color: '#ffffff',
      gridSize: 80,
      gridColor: '#9ca3af',
      opacity: 0.6,
    },
  },
  {
    id: 'dots-small',
    name: 'Small Dots',
    background: {
      type: 'dots',
      color: '#ffffff',
      gridSize: 20,
      gridColor: '#d1d5db',
      opacity: 0.8,
    },
  },
  {
    id: 'dots-medium',
    name: 'Medium Dots',
    background: {
      type: 'dots',
      color: '#ffffff',
      gridSize: 30,
      gridColor: '#9ca3af',
      opacity: 0.7,
    },
  },
  {
    id: 'dots-large',
    name: 'Large Dots',
    background: {
      type: 'dots',
      color: '#ffffff',
      gridSize: 50,
      gridColor: '#6b7280',
      opacity: 0.6,
    },
  },
  {
    id: 'lines-horizontal',
    name: 'Horizontal Lines',
    background: {
      type: 'lines',
      color: '#ffffff',
      gridSize: 40,
      gridColor: '#e5e7eb',
      opacity: 0.7,
    },
  },
];

export const getDefaultTemplate = (): BoardTemplate => BOARD_TEMPLATES[0];

// src/components/ui/AppLayout.tsx
import { useEffect, Fragment } from 'react';
import { colors, layout, spacing } from '../../styles/design-system';
import { StyledText } from './StyledComponents';
import { BoardList } from '../boards/BoardList';
import { Toolbar } from './Toolbar';
import { Canvas } from '../canvas/Canvas';
import { useBoardStore } from '../../store/boardStore';

export const AppLayout = () => {
  const { boards, activeBoard, loadBoards } = useBoardStore();
  
  useEffect(() => {
    loadBoards();
  }, [loadBoards]);

  const currentBoard = boards.find((board: any) => board.id === activeBoard);

  const mainLayoutStyle = {
    display: 'flex',
    height: '100vh',
    backgroundColor: colors.gray[50],
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  };

  const contentAreaStyle = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
  };

  const canvasAreaStyle = {
    flex: 1,
    position: 'relative' as const,
    overflow: 'hidden',
    backgroundColor: layout.canvas.backgroundColor,
  };

  const emptyStateStyle = {
    height: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[8],
    textAlign: 'center' as const,
  };

  return (
    <div style={mainLayoutStyle}>
      {/* Sidebar with boards */}
      <BoardList />
      
      {/* Main content area */}
      <div style={contentAreaStyle}>
        {/* Toolbar */}
        <Toolbar />
        
        {/* Canvas area */}
        <div style={canvasAreaStyle}>
          {currentBoard ? (
            <Fragment key={currentBoard.id}>
              <Canvas board={currentBoard} />
            </Fragment>
          ) : (
            <div style={emptyStateStyle}>
              <div style={{
                width: '80px',
                height: '80px',
                backgroundColor: colors.gray[200],
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '36px',
                marginBottom: spacing[6],
              }}>
                🎨
              </div>
              <StyledText size="2xl" weight="bold" color={colors.gray[800]} style={{ marginBottom: spacing[3] }}>
                Welcome to Whiteboard
              </StyledText>
              <StyledText size="lg" color={colors.gray[600]} style={{ marginBottom: spacing[2] }}>
                No board selected
              </StyledText>
              <StyledText size="base" color={colors.gray[500]}>
                Create a new board or select an existing one from the sidebar to get started
              </StyledText>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
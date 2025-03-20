// src/components/ui/AppLayout.tsx
import { Box, Flex } from '@chakra-ui/react';
import { BoardList } from '../boards/BoardList';
import { Toolbar } from './Toolbar';
import { Canvas } from '../canvas/Canvas';
import { useEffect } from 'react';
import { useBoardStore } from '../../store/boardStore';
import { getAllBoards } from '../../services/storage/dbService';

export const AppLayout = () => {
  const { boards, activeBoard, setActiveBoard } = useBoardStore();
  
  useEffect(() => {
    const loadBoards = async () => {
      const loadedBoards = await getAllBoards();
      if (loadedBoards.length > 0) {
        // Update store with loaded boards
        useBoardStore.setState({ boards: loadedBoards });
        
        // Set active board if none is selected
        if (!activeBoard) {
          setActiveBoard(loadedBoards[0].id);
        }
      }
    };
    
    loadBoards();
  }, []);

  return (
    <Flex h="100vh">
      <BoardList />
      <Box flex="1" position="relative">
        <Toolbar />
        {activeBoard ? (
          <Canvas />
        ) : (
          <Flex
            h="100%"
            justify="center"
            align="center"
            bg="gray.50"
            color="gray.500"
            fontWeight="medium"
          >
            Select a board or create a new one to get started
          </Flex>
        )}
      </Box>
    </Flex>
  );
};
// src/components/ui/AppLayout.tsx
import { useEffect, Fragment } from 'react';
import { Box, Flex, Text } from '@chakra-ui/react';
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

  return (
    <Flex h="100vh" bg="gray.50">
      {/* Sidebar with boards */}
      <Box w="300px" bg="white" borderRight="1px" borderColor="gray.200">
        <BoardList />
      </Box>
      
      {/* Main content area */}
      <Flex flex="1" direction="column">
        {/* Toolbar */}
        <Box borderBottom="1px" borderColor="gray.200" bg="white">
          <Toolbar />
        </Box>
        
        {/* Canvas area */}
        <Box flex="1" position="relative" overflow="hidden">
          {currentBoard ? (
            <Fragment key={currentBoard.id}>
              <Canvas board={currentBoard} />
            </Fragment>
          ) : (
            <Flex
              h="100%"
              justify="center"
              align="center"
              direction="column"
              color="gray.500"
            >
              <Text fontSize="lg" fontWeight="medium" mb={2}>
                No board selected
              </Text>
              <Text fontSize="sm">
                Create a new board or select an existing one to get started
              </Text>
            </Flex>
          )}
        </Box>
      </Flex>
    </Flex>
  );
};
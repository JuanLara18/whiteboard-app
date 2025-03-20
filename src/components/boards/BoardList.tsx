// src/components/boards/BoardList.tsx
import { useState } from 'react';
import { Box, Button, Input, VStack, Text, Flex } from '@chakra-ui/react';
import { Plus } from 'phosphor-react';
import { useBoardStore } from '../../store/boardStore';
import { BoardItem } from './BoardItem';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

export const BoardList = () => {
  const { boards, createBoard } = useBoardStore();
  const [newBoardName, setNewBoardName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  const handleCreateBoard = async () => {
    if (!newBoardName.trim()) return;
    
    await createBoard(newBoardName);
    setNewBoardName('');
    setIsCreating(false);
  };
  
  const moveBoard = (dragIndex: number, hoverIndex: number) => {
    // Implement board reordering logic
  };

  return (
    <Box bg="white" w="250px" h="100vh" p={4} boxShadow="lg">
      <Flex justify="space-between" align="center" mb={4}>
        <Text fontSize="xl" fontWeight="bold">Boards</Text>
        <Button
          leftIcon={<Plus size={16} />}
          size="sm"
          colorScheme="blue"
          onClick={() => setIsCreating(true)}
        >
          New
        </Button>
      </Flex>
      
      {isCreating && (
        <Flex mb={4}>
          <Input
            value={newBoardName}
            onChange={(e) => setNewBoardName(e.target.value)}
            placeholder="Board name"
            size="sm"
            autoFocus
            onKeyPress={(e) => {
              if (e.key === 'Enter') handleCreateBoard();
            }}
          />
            <Button
            ml={2}
            size="sm"
            colorScheme="blue"
            onClick={handleCreateBoard}
          >
            Add
          </Button>
          <Button
            ml={2}
            size="sm"
            variant="ghost"
            onClick={() => setIsCreating(false)}
          >
            Cancel
          </Button>
        </Flex>
      )}
      
      <DndProvider backend={HTML5Backend}>
        <VStack spacing={2} align="stretch" mt={4}>
          {boards.map((board, index) => (
            <BoardItem
              key={board.id}
              id={board.id}
              name={board.name}
              index={index}
              moveBoard={moveBoard}
            />
          ))}
        </VStack>
      </DndProvider>
      
      {boards.length === 0 && !isCreating && (
        <Text color="gray.500" fontSize="sm" textAlign="center" mt={8}>
          No boards yet. Create your first board to get started.
        </Text>
      )}
    </Box>
  );
};
// src/App.tsx
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/ui/AppLayout';

function App() {
  return (
    <ChakraProvider value={defaultSystem}>
      <DndProvider backend={HTML5Backend}>
        <Router>
          <Routes>
            <Route path="/" element={<AppLayout />} />
          </Routes>
        </Router>
      </DndProvider>
    </ChakraProvider>
  );
}

export default App;
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Files to fix
const filesToFix = [
  'src/components/boards/BoardList.tsx',
  'src/components/ui/AppLayout.tsx',
  'src/components/ui/Toolbar.tsx',
];

const fixFile = (filePath) => {
  console.log(`Fixing ${filePath}...`);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Add children props to components that are missing them
  
  // Fix StyledText components
  content = content.replace(
    /<StyledText([^>]+)>/g, 
    '<StyledText$1>'
  );
  
  // Fix StyledButton components  
  content = content.replace(
    /<StyledButton([^>]+)>/g,
    '<StyledButton$1>'
  );
  
  // Fix StyledBadge components
  content = content.replace(
    /<StyledBadge([^>]+)>/g,
    '<StyledBadge$1>'
  );
  
  // Fix StyledCard components
  content = content.replace(
    /<StyledCard([^>]+)>/g,
    '<StyledCard$1>'
  );
  
  // Fix StyledModal components
  content = content.replace(
    /<StyledModal([^>]+)>/g,
    '<StyledModal$1>'
  );
  
  fs.writeFileSync(filePath, content);
  console.log(`Fixed ${filePath}`);
};

// Process each file
filesToFix.forEach(file => {
  if (fs.existsSync(file)) {
    fixFile(file);
  } else {
    console.log(`File not found: ${file}`);
  }
});

console.log('Done!');

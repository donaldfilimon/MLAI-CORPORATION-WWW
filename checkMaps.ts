import fs from 'fs';
const content = fs.readFileSync('src/App.tsx', 'utf8');

const mapRegex = /\.map\([\s\S]*?=>[\s\S]*?(<[a-zA-Z0-9_\.]+)/g;

let match;
while ((match = mapRegex.exec(content)) !== null) {
  const index = match.index;
  const snippet = content.substring(index, index + 300);
  
  if (!snippet.includes('key=')) {
    const lineNo = content.substring(0, index).split('\n').length;
    console.log('Missing key near line:', lineNo);
    console.log(snippet.substring(0, 150));
    console.log('---');
  }
}

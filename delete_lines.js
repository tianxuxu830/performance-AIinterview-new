import fs from 'fs';
const lines = fs.readFileSync('components/MobileApp.tsx', 'utf-8').split('\n');
const startIdx = lines.findIndex(line => line.includes('const handleGlobalAIGenerate = async () => {'));
const endIdx = lines.findIndex(line => line.includes('// Determine if Bottom Bar should be visible'));
if (startIdx !== -1 && endIdx !== -1) {
    const newLines = [...lines.slice(0, startIdx), ...lines.slice(endIdx)];
    fs.writeFileSync('components/MobileApp.tsx', newLines.join('\n'));
    console.log('Deleted lines from', startIdx, 'to', endIdx);
} else {
    console.log('Could not find start or end index');
}

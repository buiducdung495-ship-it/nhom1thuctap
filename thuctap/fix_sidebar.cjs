const fs = require('fs');
let content = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

// The replacement messed up the bottom button and some other variables
content = content.replace(/onOpenSettings, FileSignatureModal/g, 'onOpenSettingsModal');
content = content.replace(/<Settings, FileSignature size/g, '<Settings size');
content = content.replace(/\{\/\* Settings, FileSignature button/g, '{/* Settings button');

fs.writeFileSync('src/components/Sidebar.tsx', content);

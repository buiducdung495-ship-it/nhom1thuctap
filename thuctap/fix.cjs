const fs = require('fs');
let content = fs.readFileSync('src/components/LiveChat.tsx', 'utf8');

content = content.replace(
  "import { Reply, Forward, ChatMessage, User, ChatGroup, CloudFile } from '../types';",
  "import { ChatMessage, User, ChatGroup, CloudFile } from '../types';"
);

content = content.replace(
  "import { \n  MessageSquare",
  "import { \n  Reply,\n  Forward,\n  MessageSquare"
);

fs.writeFileSync('src/components/LiveChat.tsx', content);

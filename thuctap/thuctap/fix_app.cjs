const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// The lines were broken.
// We have:
/*
          {currentTab === 'docs-incoming' && (
              currentUser={currentUser}
              users={users}
            />
          )}

          {currentTab === 'docs-outgoing' && (
              currentUser={currentUser}
              users={users}
            />
          )}
*/
content = content.replace(/\{currentTab === 'docs-incoming' && \(\s*currentUser=\{currentUser\}\s*users=\{users\}\s*\/>\s*\)\}/, '');
content = content.replace(/\{currentTab === 'docs-outgoing' && \(\s*currentUser=\{currentUser\}\s*users=\{users\}\s*\/>\s*\)\}/, '');

fs.writeFileSync('src/App.tsx', content);

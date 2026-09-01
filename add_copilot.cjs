const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('import { Copilot }')) {
  code = code.replace(
    "import { Navbar } from './components/Navbar';",
    "import { Navbar } from './components/Navbar';\nimport { Copilot } from './components/Copilot';"
  );
  
  code = code.replace(
    "</div>\n    </div>\n  );\n}",
    "</div>\n      <Copilot />\n    </div>\n  );\n}"
  );
  
  fs.writeFileSync('src/App.tsx', code);
}

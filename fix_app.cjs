const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('import { Copilot }')) {
  code = "import { Copilot } from './components/Copilot';\n" + code;
  
  code = code.replace(
    "</footer>\n    </div>\n  );\n}",
    "</footer>\n      <Copilot />\n    </div>\n  );\n}"
  );
  
  fs.writeFileSync('src/App.tsx', code);
}

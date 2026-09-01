const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Ensure Download/Printer icon is imported
if (!code.includes('Download')) {
  code = code.replace("FileText,", "FileText,\n  Download,");
}

// 2. Add button
const exportButton = `
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                  title="Print or Save as PDF"
                >
                  <Download className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">Export Report</span>
                </button>
`;
code = code.replace(
  "</button>\n              </div>\n            </div>",
  "</button>\n" + exportButton + "              </div>\n            </div>"
);

fs.writeFileSync('src/App.tsx', code);

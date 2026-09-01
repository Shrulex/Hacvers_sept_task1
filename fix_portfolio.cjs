const fs = require('fs');
let code = fs.readFileSync('src/components/PortfolioView.tsx', 'utf8');

const totalValueStr = `  const totalValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);
  const totalPnl = holdings.reduce((sum, h) => sum + h.unrealizedPnl, 0);
  const totalPnlPercent = totalValue > 0 ? (totalPnl / (totalValue - totalPnl)) * 100 : 0;`;

code = code.replace(totalValueStr, "");

code = code.replace(
  "// Smart Rebalancing Engine",
  totalValueStr + "\n\n  // Smart Rebalancing Engine"
);

fs.writeFileSync('src/components/PortfolioView.tsx', code);

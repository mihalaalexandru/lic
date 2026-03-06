const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const initialAssets = [
  { symbol: 'AAPL', name: 'Apple Inc.', type: 'STOCK', sector: 'Technology', currentPrice: 185.50 },
  { symbol: 'TSLA', name: 'Tesla Inc.', type: 'STOCK', sector: 'Automotive', currentPrice: 242.84 },
  { symbol: 'BTC', name: 'Bitcoin', type: 'CRYPTO', sector: 'Digital Currency', currentPrice: 64230.00 },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', type: 'STOCK', sector: 'Technology', currentPrice: 495.22 },
  { symbol: 'ETH', name: 'Ethereum', type: 'CRYPTO', sector: 'Digital Currency', currentPrice: 3450.12 },
  { symbol: 'MSFT', name: 'Microsoft Corp.', type: 'STOCK', sector: 'Technology', currentPrice: 378.85 },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', type: 'STOCK', sector: 'Consumer Cyclical', currentPrice: 155.20 },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', type: 'STOCK', sector: 'Technology', currentPrice: 142.65 },
  { symbol: 'META', name: 'Meta Platforms Inc.', type: 'STOCK', sector: 'Technology', currentPrice: 384.15 },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', type: 'STOCK', sector: 'Financial Services', currentPrice: 175.30 },
  { symbol: 'V', name: 'Visa Inc.', type: 'STOCK', sector: 'Financial Services', currentPrice: 275.10 },
  { symbol: 'WMT', name: 'Walmart Inc.', type: 'STOCK', sector: 'Consumer Defensive', currentPrice: 165.40 },
  { symbol: 'JNJ', name: 'Johnson & Johnson', type: 'STOCK', sector: 'Healthcare', currentPrice: 158.20 },
  { symbol: 'PG', name: 'Procter & Gamble Co.', type: 'STOCK', sector: 'Consumer Defensive', currentPrice: 150.10 },
  { symbol: 'DIS', name: 'The Walt Disney Company', type: 'STOCK', sector: 'Communication Services', currentPrice: 95.50 },
  { symbol: 'NFLX', name: 'Netflix Inc.', type: 'STOCK', sector: 'Communication Services', currentPrice: 560.30 },
  { symbol: 'SOL', name: 'Solana', type: 'CRYPTO', sector: 'Digital Currency', currentPrice: 110.45 },
  { symbol: 'ADA', name: 'Cardano', type: 'CRYPTO', sector: 'Digital Currency', currentPrice: 0.55 },
  { symbol: 'DOT', name: 'Polkadot', type: 'CRYPTO', sector: 'Digital Currency', currentPrice: 7.20 },
  { symbol: 'MATIC', name: 'Polygon', type: 'CRYPTO', sector: 'Digital Currency', currentPrice: 0.85 },
  { symbol: 'LINK', name: 'Chainlink', type: 'CRYPTO', sector: 'Digital Currency', currentPrice: 18.30 },
  { symbol: 'AVAX', name: 'Avalanche', type: 'CRYPTO', sector: 'Digital Currency', currentPrice: 35.60 }
];

const seedAndSimulate = async () => {
  try {
    const count = await prisma.asset.count();
    
    if (count === 0) {
      await prisma.asset.createMany({
        data: initialAssets
      });
    }

    setInterval(async () => {
      try {
        const assets = await prisma.asset.findMany();
        
        for (const asset of assets) {
          const fluctuation = (Math.random() * 0.01) - 0.005; 
          const newPrice = asset.currentPrice * (1 + fluctuation);
          
          await prisma.asset.update({
            where: { id: asset.id },
            data: { 
              currentPrice: parseFloat(newPrice.toFixed(2))
            }
          });
        }
      } catch (error) {
        console.error(error);
      }
    }, 5000); 

  } catch (error) {
    console.error(error);
  }
};

module.exports = seedAndSimulate;
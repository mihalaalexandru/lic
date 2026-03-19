const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const generateMassiveMarket = async () => {
  const count = await prisma.asset.count();
  
  if (count === 0) {
    try {
      const response = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
        params: {
          vs_currency: 'usd',
          order: 'market_cap_desc',
          per_page: 100,
          page: 1,
          sparkline: false
        }
      });

      const assetsToCreate = response.data.map(coin => ({
        name: coin.name,
        symbol: coin.symbol.toUpperCase(),
        type: 'CRYPTO',
        currentPrice: coin.current_price,
        change24h: coin.price_change_percentage_24h || 0
      }));

      const stockSymbols = [
        { s: 'AAPL', n: 'Apple Inc.', p: 185 }, { s: 'MSFT', n: 'Microsoft', p: 390 },
        { s: 'GOOGL', n: 'Alphabet', p: 140 }, { s: 'TSLA', n: 'Tesla', p: 190 },
        { s: 'NVDA', n: 'NVIDIA', p: 600 }, { s: 'AMZN', n: 'Amazon', p: 155 }
      ];

      stockSymbols.forEach(stock => {
        assetsToCreate.push({
          name: stock.n,
          symbol: stock.s,
          type: 'STOCK',
          currentPrice: stock.p,
          change24h: (Math.random() * 6) - 3
        });
      });

      await prisma.asset.createMany({
        data: assetsToCreate
      });
    } catch (error) {
      console.error(error);
    }
  }
};

const simulateMarket = async () => {
  try {
    const assets = await prisma.asset.findMany();
    
    for (const asset of assets) {
      const volatility = asset.type === 'CRYPTO' ? 0.002 : 0.0005;
      const change = 1 + (Math.random() * volatility * 2 - volatility);
      let newPrice = asset.currentPrice * change;
      
      const priceDiff = newPrice - asset.currentPrice;
      const newChange24h = asset.change24h + (priceDiff / asset.currentPrice) * 100;

      await prisma.asset.update({
        where: { id: asset.id },
        data: {
          currentPrice: newPrice,
          change24h: newChange24h
        }
      });

      await prisma.priceHistory.create({
        data: {
          assetId: asset.id,
          price: newPrice
        }
      });
    }
  } catch (error) {}
};

const startSimulator = async () => {
  await generateMassiveMarket();
  setInterval(simulateMarket, 5000);
};

module.exports = { startSimulator };
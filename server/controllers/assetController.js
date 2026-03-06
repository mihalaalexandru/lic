const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAssets = async (req, res) => {
  try {
    const assets = await prisma.asset.findMany({
      orderBy: { symbol: 'asc' }
    });
    res.json(assets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Eroare la preluarea activelor' });
  }
};

module.exports = {
  getAssets
};
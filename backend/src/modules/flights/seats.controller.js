const generateSeatMap = (cabinClass) => {
  const configs = {
    ECONOMY: { rows: 30, cols: ['A', 'B', 'C', 'D', 'E', 'F'], price: 0 },
    PREMIUM_ECONOMY: { rows: 8, cols: ['A', 'B', 'C', 'D'], price: 15000 },
    BUSINESS: { rows: 6, cols: ['A', 'C', 'D', 'F'], price: 50000 },
    FIRST: { rows: 3, cols: ['A', 'F'], price: 150000 }
  };

  const config = configs[cabinClass] || configs.ECONOMY;
  const occupiedSeats = new Set();

  // Randomly occupy ~40% of seats
  for (let row = 1; row <= config.rows; row++) {
    for (const col of config.cols) {
      if (Math.random() < 0.4) {
        occupiedSeats.add(`${row}${col}`);
      }
    }
  }

  const seatMap = [];
  for (let row = 1; row <= config.rows; row++) {
    const rowSeats = config.cols.map(col => ({
      id: `${row}${col}`,
      row,
      col,
      occupied: occupiedSeats.has(`${row}${col}`),
      extraLegroom: row === 1 || row === 14 || row === 15,
      price: config.price + (row <= 5 ? 10000 : 0)
    }));
    seatMap.push({ row, seats: rowSeats });
  }

  return { seatMap, config };
};

const getSeatMap = (req, res) => {
  try {
    const { cabinClass = 'ECONOMY' } = req.query;
    const { seatMap, config } = generateSeatMap(cabinClass.toUpperCase());
    res.json({ success: true, data: { seatMap, cols: config.cols, cabinClass } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getSeatMap };
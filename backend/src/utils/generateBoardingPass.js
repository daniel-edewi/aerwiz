const PDFDocument = require('pdfkit');

const generateBoardingPass = (booking, passenger) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: [600, 300], margin: 0 });
    const buffers = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    // Background
    doc.rect(0, 0, 600, 300).fill('#1e3a8a');

    // White main area
    doc.rect(20, 20, 420, 260).fill('#ffffff');

    // Stub area
    doc.rect(450, 20, 130, 260).fill('#f0f4ff');

    // Dashed separator
    doc.moveTo(445, 20).lineTo(445, 280).dash(5, { space: 5 }).stroke('#93c5fd');

    // Airline name
    doc.undash().fillColor('#1e3a8a').font('Helvetica-Bold').fontSize(18).text('✈ AERWIZ', 35, 35);

    // BOARDING PASS label
    doc.fillColor('#6b7280').font('Helvetica').fontSize(9).text('BOARDING PASS', 35, 58);

    // Route - big letters
    const origin = booking.origin || 'N/A';
    const destination = booking.destination || 'N/A';

    doc.fillColor('#1e3a8a').font('Helvetica-Bold').fontSize(36).text(origin, 35, 75);
    doc.fillColor('#6b7280').font('Helvetica').fontSize(14).text('→', 105, 88);
    doc.fillColor('#1e3a8a').font('Helvetica-Bold').fontSize(36).text(destination, 130, 75);

    // Passenger name
    doc.fillColor('#6b7280').font('Helvetica').fontSize(8).text('PASSENGER NAME', 35, 130);
    doc.fillColor('#111827').font('Helvetica-Bold').fontSize(13).text(
      `${passenger.title || ''} ${passenger.firstName} ${passenger.lastName}`.trim(), 35, 142
    );

    // Flight info row
    const col1 = 35, col2 = 140, col3 = 245, col4 = 340;
    const row1 = 175, row2 = 187;

    doc.fillColor('#6b7280').font('Helvetica').fontSize(8);
    doc.text('FLIGHT', col1, row1);
    doc.text('DATE', col2, row1);
    doc.text('CLASS', col3, row1);
    doc.text('SEAT', col4, row1);

    doc.fillColor('#111827').font('Helvetica-Bold').fontSize(11);
    doc.text(booking.flightNumber || 'N/A', col1, row2);
    doc.text(new Date(booking.departureDate).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' }), col2, row2);
    doc.text(booking.cabinClass || 'ECONOMY', col3, row2);
    doc.text(passenger.seatNumber || 'TBD', col4, row2);

    // Booking reference bar
    doc.rect(35, 215, 400, 1).fill('#e5e7eb');

    doc.fillColor('#6b7280').font('Helvetica').fontSize(8).text('BOOKING REFERENCE', 35, 225);
    doc.fillColor('#1e3a8a').font('Helvetica-Bold').fontSize(16).text(booking.bookingReference, 35, 237);

    // Status badge
    doc.rect(310, 222, 100, 22).fill('#dcfce7');
    doc.fillColor('#166534').font('Helvetica-Bold').fontSize(9).text('CONFIRMED', 325, 229);

    // Stub content
    doc.fillColor('#1e3a8a').font('Helvetica-Bold').fontSize(22).text(origin, 458, 40);
    doc.fillColor('#6b7280').font('Helvetica').fontSize(8).text('FROM', 458, 65);

    doc.fillColor('#6b7280').font('Helvetica').fontSize(14).text('↓', 468, 78);

    doc.fillColor('#1e3a8a').font('Helvetica-Bold').fontSize(22).text(destination, 458, 98);
    doc.fillColor('#6b7280').font('Helvetica').fontSize(8).text('TO', 458, 123);

    doc.rect(455, 140, 110, 1).fill('#c7d2fe');

    doc.fillColor('#6b7280').font('Helvetica').fontSize(8).text('FLIGHT', 458, 150);
    doc.fillColor('#111827').font('Helvetica-Bold').fontSize(11).text(booking.flightNumber || 'N/A', 458, 162);

    doc.fillColor('#6b7280').font('Helvetica').fontSize(8).text('SEAT', 458, 182);
    doc.fillColor('#111827').font('Helvetica-Bold').fontSize(11).text(passenger.seatNumber || 'TBD', 458, 194);

    doc.fillColor('#6b7280').font('Helvetica').fontSize(8).text('CLASS', 458, 214);
    doc.fillColor('#111827').font('Helvetica-Bold').fontSize(9).text(booking.cabinClass || 'ECONOMY', 458, 226);

    // Barcode simulation
    doc.fillColor('#1e3a8a').font('Helvetica').fontSize(6).text('| || ||| || | ||| | || ||| ||', 455, 255);
    doc.fillColor('#6b7280').font('Helvetica').fontSize(6).text(booking.bookingReference, 465, 265);

    doc.end();
  });
};

module.exports = generateBoardingPass;
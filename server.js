// Add this inside your PDF generation logic
doc.addPage()
   .fontSize(16)
   .text('Buyer Performance Ranking', { underline: true });

const sortedBuyers = Object.entries(sessionLeaderboard)
    .sort(([,a], [,b]) => b - a);

sortedBuyers.forEach(([name, total], index) => {
    doc.fontSize(12).text(`${index + 1}. ${name}: ₹${total.toLocaleString('en-IN')}`);
});

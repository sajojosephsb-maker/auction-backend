const nodemailer = require('nodemailer');
const cron = require('node-cron');

// Email Configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: 'sajojoseph.sb@gmail.com', pass: 'your-app-password' }
});

// Schedule: Every Day at 8:00 PM
cron.schedule('0 20 * * *', async () => {
    const today = new Date().setHours(0,0,0,0);
    const dailySales = await Sale.find({ timestamp: { $gte: today } });
    
    let reportTable = dailySales.map(s => 
        `Lot: ${s.lotNumber} | Planter: ${s.planterId} | Price: ₹${s.finalPrice}`).join('\n');

    const mailOptions = {
        from: 'sajojoseph.sb@gmail.com',
        to: 'sajojoseph.sb@gmail.com',
        subject: `📊 Full Daily Auction Report - ${new Date().toLocaleDateString()}`,
        text: `Daily Summary:\n\nTotal Sales: ${dailySales.length}\n\nDetails:\n${reportTable}`
    };

    transporter.sendMail(mailOptions);
    console.log("Daily Report Sent to Admin");
});

// services/emailService.js

export async function sendPriceDropEmail({ to, productName, threshold, currentPrice }) {
    // Mock sending email
    console.log(`
📧 Sending Price Drop Email
To: ${to}
Subject: 🔔 Price Alert for ${productName}
----------------------------------------
Your alert threshold: €${threshold}
Current price: €${currentPrice}

Check the product now before it goes up again!
`);
}

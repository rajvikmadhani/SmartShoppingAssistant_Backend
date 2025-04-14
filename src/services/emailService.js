import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPriceDropEmail({
    to,
    productName,
    productImage,
    threshold,
    currentPrice,
    storeName,
    productLink,
    shippingCost,
    discount,
}) {
    try {
        const { data, error } = await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: [to],
            subject: `🔔 ${productName} dropped to €${currentPrice}!`,
            html: `
        <div style="font-family: Arial, sans-serif; color: #222;">
            <h2 style="color: #2c3e50;">📉 Price Drop Alert</h2>
            <p><strong>Product:</strong> ${productName}</p>
            <img src="${productImage}" alt="${productName}" width="112" height="112" style="
                display: block;
                width: 112px; height: 112px;
                border-radius: 6px;
                box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);"
            />
            <p><strong>Your threshold:</strong> €${threshold}</p>
            <p><strong>Current price:</strong> €${currentPrice}</p>
            <p><strong>Store:</strong> ${storeName}</p>
            ${discount ? `<p><strong>Discount:</strong> ${discount}</p>` : ''}
            ${shippingCost && shippingCost !== -1 ? `<p><strong>Shipping:</strong> €${shippingCost}</p>` : ''}

            <a href="${productLink}" style="
                display: inline-block;
                padding: 10px 20px;
                margin: 15px 0;
                background-color: #3498db;
                color: #fff;
                text-decoration: none;
                border-radius: 5px;">
                🔗 View Product
            </a>

            <hr style="margin: 20px 0;" />
            <p style="font-size: 0.9em; color: #888;">
            This alert was sent to you by <strong>Smart Shopping Assistant</strong>.<br/>
            If you have questions, contact us at <a href="mailto:support@smartshopping.app">support@smartshopping.app</a>
            </p>
        </div>`,
        });

        if (error) {
            console.error('❌ Resend email error:', error);
        } else {
            console.log('📧 Email sent! ID:', data.id);
        }
    } catch (err) {
        console.error('❌ Unexpected error while sending email:', err);
    }
}

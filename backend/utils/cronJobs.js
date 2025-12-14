
const Order = require('../models/Order');
const Product = require('../models/Product');

// Run every 5 minutes
const INTERVAL_MS = 5 * 60 * 1000; 
// Order expires after 15 minutes if payment is pending
const EXPIRY_MS = 15 * 60 * 1000;

const startStockReleaseJob = () => {
  console.log('--- Stock Release Cron Job Started ---');
  
  setInterval(async () => {
    try {
      const threshold = new Date(Date.now() - EXPIRY_MS);

      // Find orders that are 'Placed' (reserved) but Payment is 'Pending' and are older than threshold
      const expiredOrders = await Order.find({
        status: 'Placed',
        paymentStatus: 'Pending',
        createdAt: { $lt: threshold }
      });

      if (expiredOrders.length === 0) return;

      console.log(`Found ${expiredOrders.length} expired orders. Releasing stock...`);

      for (const order of expiredOrders) {
        // 1. Restore Stock
        for (const item of order.items) {
          try {
            if (item.selectedVariant) {
              await Product.findOneAndUpdate(
                { _id: item.product, "variants.name": item.selectedVariant.name },
                { $inc: { "variants.$.stock": item.quantity } }
              );
            } else {
              await Product.findOneAndUpdate(
                { _id: item.product },
                { $inc: { stock: item.quantity } }
              );
            }
          } catch (err) {
            console.error(`Failed to restore stock for item ${item.title} in order ${order._id}`, err);
          }
        }

        // 2. Update Order Status
        order.status = 'Cancelled';
        order.adminNotes = (order.adminNotes || '') + '\n[System]: Auto-cancelled due to payment timeout (Stock Released).';
        await order.save();
        
        console.log(`Order ${order._id} cancelled and stock released.`);
      }

    } catch (error) {
      console.error('Error in Stock Release Job:', error);
    }
  }, INTERVAL_MS);
};

module.exports = { startStockReleaseJob };

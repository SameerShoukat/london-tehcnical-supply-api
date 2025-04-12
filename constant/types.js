const ORDER_STATUS = {
    PENDING: 'pending',
    CONFIRMED : 'confirmed',
    PROCESSING: 'processing',
    ON_HOLD: 'on_hold',
    SHIPPED: 'shipped', 
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
    RETURNED: 'returned', 
};

const PAYMENT_STATUS = {
    PENDING: 'pending',
    CAPTURED: 'captured',
    PROCESSING: 'processing',
    FAILED : 'failed',
    REFUNDED : 'refunded',
    PARTIALLY_REFUNDED : 'partially_refunded'
};

const ORDER_PAYMENT_STATUS = {
    UNPAID: 'unpaid',
    PAID: 'paid',
    PARTIALLY_PAID: 'partially_paid',
    REFUNDED: 'refunded'
};

const CURRENCY = {
    USD: 'USD',
    AED: 'AED',
    GBP: 'GBP'
};

const ADDRESS_TYPE = { 
    BILLING : 'billing', 
    SHIPPING : 'shipping',
    BOTH : 'both'
}

module.exports={
    ORDER_STATUS,
    PAYMENT_STATUS,
    ORDER_PAYMENT_STATUS,
    CURRENCY,
    ADDRESS_TYPE
}


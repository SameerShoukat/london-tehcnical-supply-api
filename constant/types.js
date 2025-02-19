export const ORDER_STATUS = {
    PENDING: 'pending',
    CONFIRMED : 'confirmed',
    PROCESSING: 'processing',
    ON_HOLD: 'on_hold',
    SHIPPED: 'shipped', 
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
    RETURNED: 'returned', 
};

export const PAYMENT_STATUS = {
    PENDING: 'pending',
    CAPTURED: 'captured',
    PROCESSING: 'processing',
    FAILED : 'failed',
    REFUNDED : 'refunded',
    PARTIALLY_REFUNDED : 'partially_refunded'
};

export const ORDER_PAYMENT_STATUS = {
    UNPAID: 'unpaid',
    PAID: 'paid',
    PARTIALLY_PAID: 'partially_paid',
};

export const CURRENCY = {
    USD: 'USD',
    AED: 'AED',
    GBP: 'GBP'
};

export const ADDRESS_TYPE = { 
    BILLING : 'billing', 
    SHIPPING : 'shipping',
    BOTH : 'both'
}



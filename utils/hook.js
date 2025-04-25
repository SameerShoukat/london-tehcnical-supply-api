
const createSlug = (value) =>{
  const shortSuffix = Math.random().toString(36).substr(2, 4);
  const uniqueSlug =   value ?  value.toLowerCase()
    .replace(/\s+/g, '_')      
    .replace(/[^\w-]+/g, '')     
    .replace(/^-+|-+$/g, '') : null   
  if(!uniqueSlug) return uniqueSlug
  return `${uniqueSlug}-${shortSuffix}`;
}

const  message = (status, message, data, count, pagination) =>{
    return{
        success : status,
        message : message,
        data : data,
        count : count,
        pagination : pagination
    }
}


const calculateFinalPrice = (pricing) => {
    try {
    if (pricing?.discountType && pricing?.discountValue) {
        const base = parseFloat(pricing?.basePrice || 0);
        const discount = parseFloat(pricing?.discountValue || 0);

        const discountAmount = pricing.discountType === "percentage"
            ? base * (discount / 100)
            : discount;

        const finalPrice = base - discountAmount;
        return {
            productPrice: finalPrice.toFixed(2),
            productDiscount: discountAmount.toFixed(2)
        };
    }
    const basePrice = Number(pricing.basePrice) || 0;
    return {
      productPrice: basePrice?.toFixed(2),
      productDiscount: 0
    };

    } catch (error) {
      console.error("Error calculating final price:", error);
      return 0;
    }
};

function generatePassword(length = 12) {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    
    return password;
  }


module.exports = {createSlug, message, calculateFinalPrice, generatePassword}
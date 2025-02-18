
const createSlug = (value) =>{
    return  value ?  value.toLowerCase()
    .replace(/\s+/g, '_')      
    .replace(/[^\w-]+/g, '')     
    .replace(/^-+|-+$/g, '') : null   

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


module.exports = {createSlug, message}
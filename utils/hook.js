
const createSlug = (value) =>{
    return  value ?  value.toLowerCase()
    .replace(/\s+/g, '_')      
    .replace(/[^\w-]+/g, '')     
    .replace(/^-+|-+$/g, '') : null   

}

const  message = (status, message, data, count) =>{
    return{
        success : status,
        message : message,
        data : data,
        count : count
    }
}


module.exports = {createSlug, message}
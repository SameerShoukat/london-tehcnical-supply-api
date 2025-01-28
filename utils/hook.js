
const createSlug = (value) =>{
    return  value ?  value.toLowerCase()
    .replace(/\s+/g, '_')      
    .replace(/[^\w-]+/g, '')     
    .replace(/^-+|-+$/g, '') : null   

}

const  message = (status, message, data) =>{
    return{
        success : status,
        message : message,
        data : data
    }
}


module.exports = {createSlug, message}
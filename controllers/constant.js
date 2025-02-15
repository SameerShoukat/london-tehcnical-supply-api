const {message} = require("../utils/hook")
const { getCode, getName, getData } = require('country-list');



async function getCountries(req, res, next) {
  try {
    const data = await getData(); 
    const countryList = data.map(val => ({ value: val.code, label: val.name }));
    return res.status(200).json(message(true, 'Countries retrieved successfully', countryList));
   }

    catch(error){
      next(error)
    }
}


module.exports = {getCountries}
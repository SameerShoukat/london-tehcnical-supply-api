const Boom = require('@hapi/boom');
const {message} = require("../utils/hook")


const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      
      const { error } = schema.validate(req.body, { 
        abortEarly: false,
        errors: { 
          wrap: { 
            label: false
          } 
        }
      });

      if (error) {
          const errors =  error.details.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            type: err.type
          }))
          return res.status(500).json(message(false, errors[0].message))
        }
        
      next();
    } catch (err) {
      next(err);
    }
  };
};
module.exports = validateRequest;
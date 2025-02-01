const { ValidationError: SequelizeValidationError, UniqueConstraintError } = require('sequelize');
const multer = require('multer');
const boom = require('@hapi/boom');

const decorateErrorResponse = (error) => {
    let errorMessage;
    let errorData = null;

    if (error instanceof SequelizeValidationError) {
        errorMessage = error.errors[0].message;
        errorData = error.errors;
    }
    else if (error instanceof UniqueConstraintError) {
        const field = Object.keys(error.fields)[0];
        errorMessage = `${field} already exists`;
        errorData = error.fields;
    }
    else if (error.isJoi) {
        errorMessage = error.details[0].message;
        errorData = error.details;
    }
    else if (error instanceof multer.MulterError) {
        errorMessage = error.message;
    }
    else if (error.isBoom) {
        errorMessage = error.output.payload.message;
        errorData = error.output.payload;
    }
    else if (error instanceof Error) {
        errorMessage = error.message;
        // Convert regular errors to Boom errors for consistent handling
        error = boom.badImplementation(error.message);
    }
    else {
        errorMessage = 'Internal server error';
        error = boom.badImplementation();
    }

    return {
        status: false,
        message: errorMessage
    };
};

const errorMiddleware = (err, req, res, next) => {
    console.error('Error:', err); // Add logging for debugging

    const formattedError = decorateErrorResponse(err);
    
    let statusCode = 500;

    if (err.isJoi) statusCode = 400;
    else if (err.isBoom) statusCode = err.output.statusCode;
    else if (err instanceof SequelizeValidationError) statusCode = 400;
    else if (err instanceof UniqueConstraintError) statusCode = 409;
    else if (err instanceof multer.MulterError) statusCode = 400;

    res.status(statusCode).json(formattedError);
};

module.exports = {
    decorateErrorResponse,
    errorMiddleware
};

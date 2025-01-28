const { ValidationError: SequelizeValidationError, UniqueConstraintError } = require('sequelize');
const multer = require('multer');

const decorateErrorResponse = (error) => {
    let errorMessage;

    if (error instanceof SequelizeValidationError) {
        errorMessage = error.errors[0].message;
    }
    else if (error instanceof UniqueConstraintError) {
        const field = Object.keys(error.fields)[0];
        errorMessage = `${field} already exists`;
    }
    else if (error.isJoi) {
        errorMessage = error.details[0].message;
    }
    else if (error instanceof multer.MulterError) {
        errorMessage = error.message;
    }
    else if (error.isBoom) {
        errorMessage = error.output.payload.message;
    }
    else if (error instanceof Error) {
        errorMessage = error.message;
    }
    else {
        errorMessage = 'Internal server error';
    }

    return {
        status: false,
        message: errorMessage
    };
};

const errorMiddleware = (err, req, res, next) => {
    const formattedError = decorateErrorResponse(err);
    
    let statusCode = 500;
    if (err.isJoi) statusCode = 400;
    if (err.isBoom) statusCode = err.output.statusCode;
    if (err instanceof SequelizeValidationError) statusCode = 400;
    if (err instanceof UniqueConstraintError) statusCode = 409;
    if (err instanceof multer.MulterError) statusCode = 400;

    res.status(statusCode).json(formattedError);
};

module.exports = {
    decorateErrorResponse,
    errorMiddleware
};
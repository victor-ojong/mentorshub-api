import { MongooseError } from 'mongoose';
import { HttpStatus } from '@nestjs/common';
import { config } from '@app/config';

const handleMongoseBadRequestError = (error: MongooseError) => {
  return {
    message: error.message,
    status: HttpStatus.BAD_REQUEST,
  };
};

const sendErrorDev = (error) => {
  return {
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    message: `${error.message} : ${error.stack}`,
  };
};

const sendErrorProd = () => {
  return {
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    message: 'Critical internal server error occurred!',
  };
};

export const mongooseErrorHandler = (error: MongooseError) => {
  if (config.env === 'production') {
    if (
      error.name === 'CastError' ||
      error.name.toLowerCase().includes('duplicat') ||
      error.name.toLowerCase().includes('validation')
    )
      return handleMongoseBadRequestError(error);

    return sendErrorProd();
  } else {
    return sendErrorDev(error);
  }
};

import { IErrorCode } from '../types';

// Domain prefixes combined with an HTTP-status suffix to form composite
// error codes (e.g. "100_400"), same convention as the reference project.
const error_code = {
  auth: '100',
  body: '101',
  upload: '102',
};

export const error_message: Record<string, IErrorCode> = {
  body_validation_error: {
    message: 'Please fill in all required fields',
    code: `${error_code.body}_400`,
  },
  email_already_exists: {
    message: 'An account with this email already exists',
    code: `${error_code.auth}_400`,
  },
  invalid_credentials: {
    message: 'Invalid email or password',
    code: `${error_code.auth}_401`,
  },
  unauthorized: {
    message: 'Unauthorized',
    code: `${error_code.auth}_401`,
  },
  forbidden: {
    message: 'You do not have permission to perform this action',
    code: `${error_code.auth}_403`,
  },
  image_required: {
    message: 'Please select an image to upload',
    code: `${error_code.upload}_400`,
  },
};

import { IErrorCode } from '../types';

// Domain prefixes combined with an HTTP-status suffix to form composite
// error codes (e.g. "100_400"), same convention as the reference project.
const error_code = {
  auth: '100',
  body: '101',
  upload: '102',
  employee: '103',
  manager: '104',
  profile: '105',
  project: '106',
  task: '107',
  comment: '108',
  attachment: '109',
  notification: '110',
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
  employee_not_found: {
    message: 'Employee not found',
    code: `${error_code.employee}_404`,
  },
  manager_not_found: {
    message: 'Manager not found',
    code: `${error_code.manager}_404`,
  },
  profile_not_found: {
    message: 'Profile not found',
    code: `${error_code.profile}_404`,
  },
  project_not_found: {
    message: 'Project not found',
    code: `${error_code.project}_404`,
  },
  invalid_project_owner: {
    message: 'Project owner must be an Admin or Manager in your business',
    code: `${error_code.project}_400`,
  },
  task_not_found: {
    message: 'Task not found',
    code: `${error_code.task}_404`,
  },
  invalid_task_project: {
    message: 'Project not found',
    code: `${error_code.task}_400`,
  },
  invalid_task_assignee: {
    message: 'Assignees must be employees in your business',
    code: `${error_code.task}_400`,
  },
  attachment_required: {
    message: 'Please select a file to upload',
    code: `${error_code.attachment}_400`,
  },
  attachment_not_found: {
    message: 'Attachment not found',
    code: `${error_code.attachment}_404`,
  },
  notification_not_found: {
    message: 'Notification not found',
    code: `${error_code.notification}_404`,
  },
};

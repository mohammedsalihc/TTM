import { ProjectPersonRef } from './project';

// Matches backend/src/controllers/commentController.ts's toCommentResponse.
// author is populated (name+photo) same as Task's assignedTo.
export interface Comment {
  id: string;
  taskId: string;
  author?: ProjectPersonRef;
  text: string;
  createdAt: string;
}

export interface CreateCommentPayload {
  text: string;
}

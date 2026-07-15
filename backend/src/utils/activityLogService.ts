import { CreateService } from '../services/createService';
import { DetailService } from '../services/detailService';

interface LogParams {
  businessId: string;
  projectId: string;
  taskId?: string;
  actorId: string;
  // The verb phrase only — the actor's name is resolved and prefixed here,
  // e.g. action: `created project "Website Revamp"` becomes the message
  // `Salih created project "Website Revamp"`.
  action: string;
}

// Append-only audit trail, written as a side-effect from Project/Task
// controllers — there's no manual "create log" endpoint, only reads (see
// projectController.activity). Best-effort: a logging failure shouldn't
// fail the request it's describing, same pattern as the welcome-email
// invite and task-assignment notifications.
export class ActivityLogService {
  private create_service = new CreateService();
  private detail_service = new DetailService();

  log = async ({ businessId, projectId, taskId, actorId, action }: LogParams): Promise<void> => {
    try {
      const actor = await this.detail_service.User({ _id: actorId });
      const message = `${actor?.name ?? 'Someone'} ${action}`;

      await this.create_service.ActivityLog({
        businessId,
        projectId,
        taskId,
        actorId,
        message,
      });
    } catch (err) {
      console.error('Failed to write activity log:', err);
    }
  };
}

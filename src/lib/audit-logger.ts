import { adminDb } from './firebase';
import { AdminAuditLog, AdminAuditLogSchema } from '../schemas/audit';
import { logger } from './logger';

export async function logAdminAction(data: Omit<AdminAuditLog, 'createdAt'>) {
  try {
    const logEntry: AdminAuditLog = {
      ...data,
      createdAt: new Date().toISOString(),
    };

    // 1. Validate Schema
    AdminAuditLogSchema.parse(logEntry);

    // 2. Persist to Firestore (MANDATO-FILTRO: Immutable Audit Trail)
    // The 'admin_audit_logs' collection will have strict rules to prevent updates/deletes
    await adminDb.collection('admin_audit_logs').add(logEntry);

    // 3. Simple Abuse Detection
    const oneHourAgo = new Date(Date.now() - 3600 * 1000).toISOString();
    const actionsSnapshot = await adminDb
      .collection('admin_audit_logs')
      .where('actorId', '==', data.actorId)
      .where('createdAt', '>', oneHourAgo)
      .count()
      .get();

    const actionCount = actionsSnapshot.data().count;

    if (actionCount > 50) {
      logger.warn('ADMIN_ABUSE_DETECTED', {
        actorId: data.actorId,
        actionCount,
        threshold: 50,
        ip: data.ip,
      });

      // In a real production environment, we would trigger an email or SMS alert here.
      // For now, it stays in the secure audit log and the system logger.
    }
  } catch (error) {
    logger.error('CRITICAL: Audit Logging Failed', {
      error: error instanceof Error ? error.message : error,
      actor: data.actorId,
      action: data.action,
    });
  }
}

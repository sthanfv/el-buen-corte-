import { adminDb } from './firebase';

type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'AUDIT';

interface LogMetadata {
    uid?: string;
    ip?: string;
    endpoint?: string;
    resourceId?: string;
    [key: string]: any;
}

class Logger {
    private isDev = process.env.NODE_ENV === 'development';

    /**
     * Standard logging to console/runtime logs
     */
    private logToConsole(level: LogLevel, message: string, meta?: LogMetadata) {
        if (level === 'DEBUG' && !this.isDev) return;

        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level,
            message,
            ...meta
        };

        if (level === 'ERROR' || level === 'AUDIT') {
            console.error(JSON.stringify(logEntry));
        } else if (level === 'WARN') {
            console.warn(JSON.stringify(logEntry));
        } else {
            console.log(JSON.stringify(logEntry));
        }
    }

    /**
     * Persist critical security events to Firestore for permanent audit trail
     */
    private async persistToAudit(message: string, meta: LogMetadata) {
        try {
            await adminDb.collection('security_audits').add({
                timestamp: new Date().toISOString(),
                type: 'AUDIT',
                message,
                ...meta
            });
        } catch (error) {
            // Fallback to console if Firestore fails
            console.error('[CRITICAL] Failed to persist audit log to Firestore:', error);
        }
    }

    info(message: string, meta?: LogMetadata) {
        this.logToConsole('INFO', message, meta);
    }

    warn(message: string, meta?: LogMetadata) {
        this.logToConsole('WARN', message, meta);
    }

    error(message: string, meta?: LogMetadata) {
        this.logToConsole('ERROR', message, meta);
    }

    /**
     * AUDIT level is for critical security events that MUST be traceable.
     * Persists to both Console and Firestore.
     */
    async audit(message: string, meta: LogMetadata) {
        this.logToConsole('AUDIT', message, meta);
        await this.persistToAudit(message, meta);
    }

    debug(message: string, meta?: LogMetadata) {
        this.logToConsole('DEBUG', message, meta);
    }
}

export const logger = new Logger();

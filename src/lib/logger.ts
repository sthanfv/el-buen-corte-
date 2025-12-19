import * as Sentry from '@sentry/nextjs';
import { adminDb } from './firebase';

/**
 * Professional Logger Utility with Sentry and Firestore Integration
 * Protocolo: MANDATO-FILTRO.
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug' | 'audit';

class Logger {
    private isProduction = process.env.NODE_ENV === 'production';

    constructor() {
        if (this.isProduction && process.env.SENTRY_DSN) {
            Sentry.init({
                dsn: process.env.SENTRY_DSN,
                tracesSampleRate: 1.0,
            });
        }
    }

    private formatMessage(level: LogLevel, message: string, data?: any) {
        const timestamp = new Date().toISOString();
        return `[${timestamp}] [${level.toUpperCase()}]: ${message} ${data ? JSON.stringify(data) : ''}`;
    }

    private async persistLog(level: LogLevel, message: string, data?: any) {
        try {
            // Guardar solo logs críticos o de auditoría en Firestore para evitar saturación
            if (level === 'error' || level === 'audit' || level === 'warn') {
                await adminDb.collection('system_logs').add({
                    level,
                    message,
                    data: data ? JSON.parse(JSON.stringify(data)) : null,
                    timestamp: new Date().toISOString()
                });
            }
        } catch (e) {
            console.error('Failed to persist log to Firestore', e);
        }
    }

    info(message: string, data?: any) {
        if (!this.isProduction) {
            console.info(this.formatMessage('info', message, data));
        }
    }

    warn(message: string, data?: any) {
        console.warn(this.formatMessage('warn', message, data));
        this.persistLog('warn', message, data);
        if (this.isProduction) {
            Sentry.captureMessage(message, { level: 'warning', extra: data });
        }
    }

    error(message: string, data?: any) {
        console.error(this.formatMessage('error', message, data));
        this.persistLog('error', message, data);
        if (this.isProduction) {
            if (data instanceof Error) {
                Sentry.captureException(data);
            } else {
                Sentry.captureException(new Error(message), { extra: data });
            }
        }
    }

    audit(message: string, data?: any) {
        console.log(this.formatMessage('audit', message, data));
        this.persistLog('audit', message, data);
        if (this.isProduction) {
            Sentry.captureMessage(`AUDIT: ${message}`, { level: 'info', extra: data });
        }
    }

    debug(message: string, data?: any) {
        if (!this.isProduction) {
            console.debug(this.formatMessage('debug', message, data));
        }
    }
}

export const logger = new Logger();

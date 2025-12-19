'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface Props {
    children?: ReactNode;
    fallbackTitle?: string;
}

interface State {
    hasError: boolean;
}

/**
 * Componente ErrorBoundary (MANDATO-FILTRO)
 * Implementa "Graceful Degradation": Si un componente falla, el resto de la app sigue viva.
 */
class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
    };

    public static getDerivedStateFromError(_: Error): State {
        return { hasError: true };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="p-8 border-2 border-dashed border-red-500/20 rounded-2xl bg-red-50/50 dark:bg-red-950/10 text-center space-y-4">
                    <div className="flex justify-center">
                        <AlertTriangle className="w-12 h-12 text-red-500 animate-bounce" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-black italic uppercase text-red-600">
                            {this.props.fallbackTitle || 'Fallo en el Módulo'}
                        </h3>
                        <p className="text-xs text-red-800/60 dark:text-red-400/60 font-medium">
                            Este componente ha tenido un incidente técnico. El MANDATO-FILTRO ha aislado el error para proteger el resto de la interfaz.
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => this.setState({ hasError: false })}
                        className="border-red-500/50 text-red-600 hover:bg-red-500 hover:text-white font-bold italic gap-2"
                    >
                        <RefreshCcw size={14} /> Reintentar Carga
                    </Button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

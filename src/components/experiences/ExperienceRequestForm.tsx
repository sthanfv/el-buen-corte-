'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Flame, Loader2 } from 'lucide-react';

interface Props {
    onSuccess: () => void;
}

export default function ExperienceRequestForm({ onSuccess }: Props) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ fullName: '', reason: '' });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/experiences/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (res.ok) {
                toast({ title: 'Solicitud Enviada', message: data.message, type: 'success' });
                onSuccess();
            } else {
                toast({ title: 'Error', message: data.error, type: 'error' });
            }
        } catch (error) {
            toast({ title: 'Error', message: 'Error de conexión', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-primary/5 border-2 border-primary/20 p-8 md:p-12 text-center space-y-6 relative overflow-hidden group rounded-lg">
            <div className="absolute -right-10 -bottom-10 opacity-5 group-hover:opacity-10 transition-opacity">
                <Flame size={200} className="text-primary" />
            </div>

            <h3 className="text-3xl font-black italic uppercase">ÚNETE A NUESTRAS EXPERIENCIAS</h3>
            <p className="max-w-xl mx-auto text-gray-400 italic font-medium leading-relaxed">
                Reserva tu lugar para poder compartir tus experiencias, calificar nuestro servicio y acceder a eventos exclusivos.
            </p>

            <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4 relative z-10 text-left">
                <div className="space-y-2">
                    <label className="text-xs font-black tracking-widest uppercase italic">Nombre Completo</label>
                    <Input
                        required
                        placeholder="Ej: Juan Pérez"
                        className="bg-black/40 border-white/10"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-black tracking-widest uppercase italic">¿Por qué quieres unirte?</label>
                    <Textarea
                        required
                        placeholder="Cuéntanos brevemente tu interés..."
                        className="bg-black/40 border-white/10 min-h-[100px]"
                        value={formData.reason}
                        onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    />
                </div>
                <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary hover:bg-white hover:text-black font-black italic tracking-widest h-12 transition-all duration-500"
                >
                    {loading ? <Loader2 className="animate-spin" /> : 'ENVIAR SOLICITUD DE RESERVA'}
                </Button>
            </form>
        </div>
    );
}

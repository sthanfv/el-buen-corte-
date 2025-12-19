'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Star, Loader2 } from 'lucide-react';

interface Props {
    onSuccess: () => void;
}

export default function ExperienceCommentForm({ onSuccess }: Props) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ content: '', rating: 5, category: 'service' });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/experiences/comment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (res.ok) {
                toast({ title: 'Enviado', message: data.message, type: 'success' });
                setFormData({ content: '', rating: 5, category: 'service' });
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
        <div className="bg-secondary/10 border border-white/10 p-8 rounded-lg space-y-6">
            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <MessageSquare className="text-primary w-6 h-6" />
                <h3 className="text-2xl font-black italic uppercase">COMPARTE TU EXPERIENCIA</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black tracking-widest uppercase italic text-gray-400">¿Qué deseas calificar?</label>
                        <Select
                            value={formData.category}
                            onValueChange={(val: any) => setFormData({ ...formData, category: val })}
                        >
                            <SelectTrigger className="bg-black/40 border-white/10 italic">
                                <SelectValue placeholder="Categoría" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-zinc-800 text-white italic">
                                <SelectItem value="service">Servicio de Venta</SelectItem>
                                <SelectItem value="price">Precios</SelectItem>
                                <SelectItem value="delivery">Entrega / Logística</SelectItem>
                                <SelectItem value="other">Otros</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black tracking-widest uppercase italic text-gray-400">Calificación</label>
                        <div className="flex gap-2 p-1">
                            {[1, 2, 3, 4, 5].map(num => (
                                <button
                                    key={num}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, rating: num })}
                                    className="transition-transform active:scale-90"
                                >
                                    <Star
                                        className={`w-6 h-6 ${formData.rating >= num ? 'text-yellow-500 fill-yellow-500' : 'text-gray-600'}`}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black tracking-widest uppercase italic text-gray-400">Tu Comentario</label>
                    <Textarea
                        required
                        placeholder="Cuéntanos los detalles de tu experiencia con El Buen Corte..."
                        className="bg-black/40 border-white/10 min-h-[120px] italic"
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    />
                </div>

                <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary hover:bg-white hover:text-black font-black italic tracking-widest h-12 transition-all duration-500"
                >
                    {loading ? <Loader2 className="animate-spin" /> : 'PUBLICAR EXPERIENCIA'}
                </Button>
            </form>
        </div>
    );
}

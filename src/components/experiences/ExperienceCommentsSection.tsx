'use client';

import { useState, useEffect } from 'react';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import { Star, Clock, User, Quote, MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export default function ExperienceCommentsSection() {
    const [comments, setComments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchComments = async () => {
        try {
            const res = await fetch('/api/experiences/comment');
            if (res.ok) {
                setComments(await res.json());
            }
        } catch (error) {
            console.error('Error al cargar comentarios', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComments();
    }, []);

    if (loading) return <div className="text-center py-20 animate-pulse text-gray-500 italic">Cargando experiencias de la comunidad...</div>;

    return (
        <div className="space-y-12">
            <h2 className="text-3xl font-black italic border-b border-white/5 pb-8 flex items-center gap-3">
                <MessageCircle className="text-primary" /> COMUNIDAD EL BUEN CORTE
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {comments.length === 0 && <p className="text-muted-foreground italic col-span-2">Aún no hay experiencias publicadas. ¡Sé el primero!</p>}
                {comments.map((comment) => (
                    <Card key={comment.id} className="bg-secondary/5 border border-white/5 p-6 rounded-lg relative group hover:border-primary/30 transition-all duration-500">
                        <Quote className="absolute top-4 right-4 text-white/5 group-hover:text-primary/10 w-12 h-12 transition-all italic" />

                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black italic">
                                {comment.authorName?.[0] || 'U'}
                            </div>
                            <div>
                                <span className="font-bold block text-sm italic">{comment.authorName}</span>
                                <div className="flex gap-1">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Star key={i} size={10} className={i < comment.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-700"} />
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="bg-primary/10 text-primary text-[9px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded inline-block mb-3 italic">
                            {comment.category === 'service' ? 'Servicio Ventas' : comment.category === 'delivery' ? 'Logística' : 'Precios'}
                        </div>

                        <p className="text-gray-300 text-sm italic leading-relaxed mb-4">
                            "{comment.content}"
                        </p>

                        <div className="flex items-center gap-2 text-[9px] text-gray-600 font-bold uppercase tracking-widest italic pt-4 border-t border-white/5">
                            <Clock size={10} /> {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: es })}
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}

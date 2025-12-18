import React from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Flame, MapPin, Clock, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Image from 'next/image';

const POSTS = [
    {
        category: 'Técnicas',
        title: 'El Secreto del Sellado Perfecto: Maillard en Acción',
        excerpt: '¿Por qué esa costra crujiente es tan irresistible? Te enseñamos cómo lograrla en cualquier corte.',
        image: 'https://images.unsplash.com/photo-1544022613-e87cd75a784a?q=80&w=800&auto=format&fit=crop',
        date: '15 Dic, 2025'
    },
    {
        category: 'Experiencias',
        title: 'Noche de Madurados: Un viaje sensorial',
        excerpt: 'Revive lo mejor de nuestra última cata privada donde degustamos lomos con 45 días de maduración.',
        image: 'https://images.unsplash.com/photo-1546241072-48010ad28c2c?q=80&w=800&auto=format&fit=crop',
        date: '10 Dic, 2025'
    },
    {
        category: 'Cultura',
        title: 'Angus vs Wagyu: ¿Cuál es el Rey de la Mesa?',
        excerpt: 'Desmitificamos las diferencias entre las razas más prestigiosas del mundo cárnico.',
        image: 'https://images.unsplash.com/photo-1558030006-450675393462?q=80&w=800&auto=format&fit=crop',
        date: '05 Dic, 2025'
    }
];

export default function BlogPage() {
    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-primary selection:text-white">
            {/* Hero Section */}
            <div className="relative h-[50vh] flex items-center justify-center overflow-hidden border-b border-white/10 uppercase italic">
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
                <Image
                    src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1600&auto=format&fit=crop"
                    alt="Grill background"
                    fill
                    className="object-cover opacity-50 contrast-125"
                />
                <div className="relative z-20 text-center space-y-4 px-4">
                    <Flame className="w-12 h-12 text-primary mx-auto animate-pulse" />
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none italic">
                        BLOG & <span className="text-primary italic">EXP</span>
                    </h1>
                    <p className="text-gray-400 tracking-[0.5em] text-xs font-bold font-mono">CULTURA PARRILLERA DE ALTO NIVEL</p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-20">
                <div className="flex items-center justify-between mb-16 border-b border-white/5 pb-8">
                    <h2 className="text-3xl font-black italic">ARTÍCULOS RECIENTES</h2>
                    <Link href="/">
                        <Button variant="ghost" className="text-gray-400 hover:text-white gap-2 border border-white/10">
                            <ArrowLeft size={16} /> VOLVER A TIENDA
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {POSTS.map((post, idx) => (
                        <Card key={idx} className="bg-transparent border-none group cursor-pointer overflow-hidden rounded-none">
                            <div className="relative h-64 mb-6 overflow-hidden border border-white/10">
                                <div className="absolute top-4 left-4 z-10 bg-primary px-3 py-1 text-[10px] font-black uppercase tracking-widest italic antialiased">
                                    {post.category}
                                </div>
                                <Image
                                    src={post.image}
                                    alt={post.title}
                                    fill
                                    className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700 ease-in-out opacity-80 group-hover:opacity-100"
                                />
                            </div>
                            <CardTitle className="text-xl font-black transition-colors group-hover:text-primary leading-tight mb-2 italic">
                                {post.title}
                            </CardTitle>
                            <CardDescription className="text-gray-500 mb-4 line-clamp-2 italic">
                                {post.excerpt}
                            </CardDescription>
                            <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono font-bold tracking-widest italic">
                                <span className="flex items-center gap-2"><Clock size={12} /> {post.date}</span>
                                <span className="flex items-center gap-2 text-primary">LEER MÁS <ArrowLeft className="rotate-180" size={12} /></span>
                            </div>
                        </Card>
                    ))}
                </div>

                <div className="mt-32 bg-primary/5 border-2 border-primary/20 p-12 text-center space-y-6 relative overflow-hidden group hover:border-primary transition-all duration-1000">
                    <div className="absolute -right-20 -bottom-20 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Flame size={300} className="text-primary" />
                    </div>
                    <Star className="w-10 h-10 text-primary mx-auto" />
                    <h3 className="text-4xl font-black italic uppercase">ÚNETE A NUESTRAS EXPERIENCIAS</h3>
                    <p className="max-w-xl mx-auto text-gray-400 italic font-medium leading-relaxed">
                        No solo vendemos carne. Creamos momentos inolvidables alrededor del fuego.
                        Suscríbete para recibir invitaciones exclusivas a nuestras catas privadas y masterclasses.
                    </p>
                    <Button size="lg" className="bg-primary hover:bg-white hover:text-black font-black italic tracking-widest h-14 px-10 transition-all duration-500">
                        RESERVAR LUGAR
                    </Button>
                </div>
            </div>
        </div>
    );
}

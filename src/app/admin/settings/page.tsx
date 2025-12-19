'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ConfigSchema, ConfigData, useConfig, saveConfig } from '@/lib/config';
import AdminGuard from '@/components/AdminGuard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Settings } from 'lucide-react';
import { useEffect } from 'react';

export default function SettingsPage() {
    const { toast } = useToast();
    const { config, loading } = useConfig();

    const form = useForm<ConfigData>({
        resolver: zodResolver(ConfigSchema),
        defaultValues: {
            contactPhone: '',
            contactAddress: '',
            contactEmail: '',
            footerText: '',
            instagramUrl: '',
            facebookUrl: '',
            twitterUrl: '',
        }
    });

    // Populate form when config loads
    useEffect(() => {
        if (config) {
            form.reset(config);
        }
    }, [config, form]);

    const onSubmit = async (data: ConfigData) => {
        try {
            await saveConfig(data);
            toast({ type: 'success', message: 'Configuración guardada correctamente.' });
        } catch (error) {
            toast({ type: 'error', message: 'Error al guardar.' });
        }
    };

    if (loading) {
        return <div className="p-10 text-center"><Loader2 className="animate-spin h-8 w-8 mx-auto" /></div>;
    }

    return (
        <AdminGuard>
            <div className="container mx-auto p-6 max-w-4xl">
                <div className="mb-10">
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white italic uppercase tracking-tighter flex items-center gap-3">
                        <Settings className="w-8 h-8 text-primary" />
                        Ajustes Globales
                    </h1>
                    <p className="text-sm font-medium text-muted-foreground mt-1">
                        Personaliza la información de contacto y metadatos de la plataforma.
                    </p>
                </div>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <Card className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 shadow-xl">
                        <CardHeader>
                            <CardTitle className="text-xl font-black italic uppercase tracking-tighter mb-1">Información de Contacto</CardTitle>
                            <CardDescription className="text-xs font-medium">Estos datos aparecerán en el pie de página de toda la web.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Teléfono / WhatsApp</Label>
                                    <Input {...form.register('contactPhone')} placeholder="+57 300 123 4567" />
                                    {form.formState.errors.contactPhone && <p className="text-destructive text-xs">{form.formState.errors.contactPhone.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label>Email de Contacto</Label>
                                    <Input {...form.register('contactEmail')} placeholder="contacto@buencorte.co" />
                                    {form.formState.errors.contactEmail && <p className="text-destructive text-xs">{form.formState.errors.contactEmail.message}</p>}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Dirección Física</Label>
                                <Input {...form.register('contactAddress')} placeholder="Calle 123 # 45-67, Bogotá" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 shadow-xl">
                        <CardHeader>
                            <CardTitle className="text-xl font-black italic uppercase tracking-tighter mb-1">Identidad & Social Media</CardTitle>
                            <CardDescription className="text-xs font-medium">Gestiona tu presencia digital y narrativa de marca.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Texto Descriptivo</Label>
                                <Textarea {...form.register('footerText')} placeholder="Breve descripción de la empresa..." />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>Instagram URL</Label>
                                    <Input {...form.register('instagramUrl')} placeholder="https://instagram.com/..." />
                                </div>
                                <div className="space-y-2">
                                    <Label>Facebook URL</Label>
                                    <Input {...form.register('facebookUrl')} placeholder="https://facebook.com/..." />
                                </div>
                                <div className="space-y-2">
                                    <Label>Twitter / X URL</Label>
                                    <Input {...form.register('twitterUrl')} placeholder="https://x.com/..." />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Button type="submit" disabled={form.formState.isSubmitting} className="w-full md:w-auto">
                        {form.formState.isSubmitting ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2 h-4 w-4" />}
                        Guardar Cambios
                    </Button>
                </form>
            </div>
        </AdminGuard>
    );
}

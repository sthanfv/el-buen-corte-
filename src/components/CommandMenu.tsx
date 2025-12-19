"use client"

import { useEffect, useState } from "react"
import { Command } from "cmdk"
import { useRouter } from "next/navigation"
import {
    Home,
    ShoppingCart,
    Lock,
    ChefHat,
    Search,
    Phone,
    ShieldCheck,
    User
} from "lucide-react"

/**
 * CommandMenu (MANDATO-FILTRO: Nivel Google)
 * Paleta de comandos global para navegación experta (Power Users).
 */
export function CommandMenu() {
    const [open, setOpen] = useState(false)
    const router = useRouter()

    // Escuchar Ctrl + K o Cmd + K
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }
        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])

    const runCommand = (command: () => void) => {
        setOpen(false)
        command()
    }

    return (
        <Command.Dialog
            open={open}
            onOpenChange={setOpen}
            label="Global Command Menu"
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-[640px] bg-white dark:bg-zinc-900 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] rounded-2xl border border-black/5 dark:border-white/10 z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        >
            <div className="flex items-center border-b border-black/5 dark:border-white/10 px-4">
                <Search className="mr-3 text-muted-foreground" size={20} />
                <Command.Input
                    placeholder="Escribe un comando o busca carne..."
                    className="w-full py-6 text-lg outline-none bg-transparent dark:text-white placeholder:text-muted-foreground/50"
                />
                <div className="flex items-center gap-1">
                    <kbd className="px-2 py-1 text-[10px] font-black bg-zinc-100 dark:bg-zinc-800 rounded border border-black/10 dark:border-white/10 text-muted-foreground mr-2">ESC</kbd>
                </div>
            </div>

            <Command.List className="max-h-[400px] overflow-y-auto p-3 scrollbar-hide">
                <Command.Empty className="py-12 text-center">
                    <div className="flex flex-col items-center gap-2 opacity-50">
                        <Search size={40} className="text-primary" />
                        <p className="text-sm font-bold uppercase italic">No encontramos ese comando...</p>
                    </div>
                </Command.Empty>

                <Command.Group heading="Navegación Rápida" className="px-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 mt-2">
                    <Command.Item
                        onSelect={() => runCommand(() => router.push('/'))}
                        className="flex items-center gap-3 p-3 hover:bg-primary/5 dark:hover:bg-primary/10 cursor-pointer rounded-xl transition-all aria-selected:bg-primary/10 dark:aria-selected:bg-primary/20"
                    >
                        <Home size={18} className="text-primary" />
                        <span className="font-bold text-sm">Ir al Inicio del Corte</span>
                    </Command.Item>

                    <Command.Item
                        onSelect={() => runCommand(() => {
                            const element = document.getElementById('catalogo');
                            if (element) element.scrollIntoView({ behavior: 'smooth' });
                        })}
                        className="flex items-center gap-3 p-3 hover:bg-primary/5 dark:hover:bg-primary/10 cursor-pointer rounded-xl transition-all aria-selected:bg-primary/10 dark:aria-selected:bg-primary/20"
                    >
                        <ChefHat size={18} className="text-primary" />
                        <span className="font-bold text-sm">Explorar Catálogo Premium</span>
                    </Command.Item>
                </Command.Group>

                <Command.Group heading="Atención & Soporte" className="px-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 mt-4">
                    <Command.Item
                        onSelect={() => runCommand(() => window.open('https://wa.me/573001234567', '_blank'))}
                        className="flex items-center gap-3 p-3 hover:bg-green-500/5 dark:hover:bg-green-500/10 cursor-pointer rounded-xl transition-all aria-selected:bg-green-500/10"
                    >
                        <Phone size={18} className="text-green-600" />
                        <span className="font-bold text-sm">Hablar con Maestro Carnicero</span>
                    </Command.Item>

                    <Command.Item
                        onSelect={() => runCommand(() => router.push('/privacy'))}
                        className="flex items-center gap-3 p-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer rounded-xl transition-all aria-selected:bg-zinc-200"
                    >
                        <ShieldCheck size={18} className="text-muted-foreground" />
                        <span className="font-bold text-sm">Política de Privacidad (Ley 1581)</span>
                    </Command.Item>
                </Command.Group>

                <Command.Group heading="Personal Administrativo" className="px-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 mt-4">
                    <Command.Item
                        onSelect={() => runCommand(() => router.push('/admin/orders'))}
                        className="flex items-center gap-3 p-3 hover:bg-red-500/5 dark:hover:bg-red-500/10 cursor-pointer rounded-xl transition-all aria-selected:bg-red-500/10 group"
                    >
                        <Lock size={18} className="text-red-500 group-hover:animate-bounce" />
                        <span className="font-bold text-sm text-red-600">Dashboard Administrativo</span>
                    </Command.Item>
                </Command.Group>
            </Command.List>

            <div className="border-t border-black/5 dark:border-white/10 p-3 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50">
                <p className="text-[10px] font-bold text-muted-foreground">EL BUEN CORTE v2.5.0 • ARMA ÉLITE</p>
                <div className="flex gap-2">
                    <span className="flex items-center gap-1 text-[9px] font-black bg-white dark:bg-zinc-800 px-2 py-0.5 rounded border border-black/5 dark:border-white/5 shadow-sm">
                        <span className="text-primary tracking-tighter">↵</span> ENTER
                    </span>
                </div>
            </div>
        </Command.Dialog>
    )
}

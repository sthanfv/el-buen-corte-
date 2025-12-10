"use client";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase/client";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, LogIn, Eye, EyeOff, ArrowLeft, ShieldCheck, ChefHat } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Login() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      toast({ type: "error", message: "Correo y contraseña son requeridos." });
      return;
    }
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // El AdminGuard se encargará de verificar el claim y redirigir
      router.push("/admin/dashboard");
    } catch (err) {
      toast({ type: "error", message: "Credenciales inválidas o sin permisos de administrador." });
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-gradient-to-br from-gray-950 via-gray-900 to-black overflow-hidden relative">

      {/* Botón Flotante para Salir */}
      <div className="absolute top-6 left-6 z-50">
        <Link href="/">
          <Button variant="outline" className="bg-black/40 backdrop-blur-md border-white/10 text-white hover:bg-primary hover:text-white hover:border-primary transition-all duration-300">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a la Tienda
          </Button>
        </Link>
      </div>

      {/* Lado Izquierdo: Visual & Branding */}
      <div className="hidden lg:flex flex-col justify-between p-12 relative border-r border-white/5">
        <div className="absolute inset-0 z-0">
          {/* Fondo abstracto simulando humo/carbón */}
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-gray-800/20 via-transparent to-transparent opacity-50"></div>
          {/* Imagen de fondo sutil - Para cambiarla, sube tu foto a public/login-bg.jpg */}
          <Image
            src="/login-bg.jpg"
            alt="Carne Premium"
            fill
            className="object-cover opacity-30 mix-blend-overlay"
            priority
          />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <ChefHat className="w-10 h-10 text-primary" />
            <h1 className="text-4xl font-black text-white tracking-tighter">
              Buen<span className="text-primary">Corte</span>
            </h1>
          </div>
          <p className="text-xl text-gray-400 font-light max-w-md">
            Gestión interna de inventario, trazabilidad de cortes premium y control de calidad.
          </p>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/5 backdrop-blur-sm">
            <ShieldCheck className="w-8 h-8 text-green-500 mt-1" />
            <div>
              <h3 className="text-white font-bold">Panel Seguro</h3>
              <p className="text-sm text-gray-400">Acceso restringido únicamente a personal autorizado. Todas las operaciones son monitoreadas.</p>
            </div>
          </div>
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} El Buen Corte S.A.S. - Sistema de Gestión Interna v2.0
          </p>
        </div>
      </div>

      {/* Lado Derecho: Formulario */}
      <div className="flex items-center justify-center p-6 lg:p-12 relative">
        {/* Decoración de fondo móvil */}
        <div className="absolute inset-0 lg:hidden z-0">
          <Image
            src="https://images.unsplash.com/photo-1544025162-d7669d26560e?q=80&w=1000&auto=format&fit=crop"
            alt="Background Mobile"
            fill
            className="object-cover opacity-10"
          />
        </div>

        <Card className="w-full max-w-md bg-black/40 backdrop-blur-xl border-white/10 shadow-2xl relative z-10">
          <CardContent className="p-8">
            <div className="mb-8 text-center lg:text-left">
              <div className="inline-flex lg:hidden items-center gap-2 mb-4">
                <ChefHat className="w-8 h-8 text-primary" />
                <span className="text-2xl font-black text-white">BuenCorte</span>
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Bienvenido de nuevo</h2>
              <p className="text-gray-400">Ingresa tus credenciales de administrador</p>
            </div>

            <form onSubmit={login} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">Correo Corporativo</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@buencorte.co"
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-primary focus:ring-primary h-12"
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-gray-300">Contraseña Segura</Label>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-primary focus:ring-primary h-12 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full h-12 text-base font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin mr-2" /> : <LogIn className="mr-2 h-5 w-5" />}
                {isLoading ? 'Verificando...' : 'Acceder al Panel'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

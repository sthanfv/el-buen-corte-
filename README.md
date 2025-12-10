# Proyecto: Buen Corte - Catálogo Digital y Generador de Pedidos

![Buen Corte Hero](https://picsum.photos/seed/hero-main/1200/300)

## 1. Descripción General del Proyecto

"Buen Corte" es una aplicación web moderna diseñada para funcionar como el catálogo digital y el canal principal de generación de pedidos para una carnicería. Resuelve la necesidad de tener una presencia digital profesional sin la complejidad de un e-commerce tradicional, finalizando el flujo de compra con un pedido estandarizado enviado a través de WhatsApp.

---

## 2. Estado Actual del Proyecto (Diagnóstico Técnico)

Esta sección sirve como una "única fuente de verdad" sobre el estado actual del desarrollo.

### 2.1. Estructura del Proyecto

La estructura de carpetas está organizada para promover la modularidad y la separación de responsabilidades, siguiendo las convenciones de Next.js App Router.

```
src/
├── app/                  # Rutas de la aplicación (App Router)
│   ├── page.tsx          # Página de inicio y catálogo público
│   ├── layout.tsx        # Layout principal
│   ├── globals.css       # Estilos globales y variables de Tailwind/ShadCN
│   ├── admin/            # Rutas protegidas del panel de administración
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── products/
│   │       ├── page.tsx          # Listado de productos
│   │       └── new/
│   │           └── page.tsx      # Formulario para crear producto
│   └── api/                # Endpoints del backend (API Routes)
│       ├── auth/
│       │   └── set-admin/
│       │       └── route.ts
│       ├── products/
│       │   ├── create/route.ts
│       │   ├── delete/route.ts
│       │   ├── list/route.ts
│       │   └── update/route.ts
│       └── upload/
│           ├── blob/route.ts
│           └── cloudinary/route.ts
├── components/           # Componentes de React reutilizables (UI y de lógica)
│   ├── ui/               # Componentes base de ShadCN (Button, Card, etc.)
│   ├── AdminGuard.tsx    # Componente de alta ordem para proteger rutas
│   ├── CartSidebar.tsx   # Carrito de compras deslizable
│   ├── Header.tsx        # Cabecera principal
│   ├── MeatProductCard.tsx # Tarjeta de producto para el catálogo
│   └── ...
├── data/                 # Datos estáticos (actualmente mock de productos)
│   └── products.ts
├── hooks/                # Hooks de React personalizados
│   └── use-toast.ts
├── lib/                  # Funciones de utilidad y configuración
│   ├── firebase.ts       # Configuración y exportación de Firebase (cliente y admin)
│   └── utils.ts          # Funciones de utilidad (ej. cn para clases)
└── ...
```

### 2.2. Checklist de Funcionalidades

| Funcionalidad                        | Implementado | Notas                                                                         |
| :----------------------------------- | :----------: | :---------------------------------------------------------------------------- |
| **Login Admin**                      |  ✅ **Sí**   | Formulario funcional que autentica contra Firebase.                           |
| **AdminGuard / Protección de rutas** |  ✅ **Sí**   | Protege las rutas bajo `/admin/*` verificando el `custom claim`.              |
| **Dashboard**                        |  ✅ **Sí**   | Página de bienvenida del admin con enlaces a otras secciones.                 |
| **CRUD productos**                   |  ✅ **Sí**   | Endpoints de API para Crear, Leer, Actualizar y Eliminar productos.           |
| **Integración con Firestore**        |  ✅ **Sí**   | Los endpoints de la API usan el SDK de Admin para operar en Firestore.        |
| **Upload imágenes**                  |  ✅ **Sí**   | Endpoints de API para subir archivos a Vercel Blob y Cloudinary.              |
| **Vercel Blob**                      |  ✅ **Sí**   | El endpoint `api/upload/blob` está implementado.                              |
| **Cloudinary**                       |  ✅ **Sí**   | El endpoint `api/upload/cloudinary` está implementado.                        |
| **Frontend público funcionando**     |  ✅ **Sí**   | El catálogo, carrito y flujo de pedido por WhatsApp son funcionales.          |
| **Catálogo conectado a Firestore**   |  ❌ **No**   | El frontend público actualmente consume datos mock de `src/data/products.ts`. |
| **Toast System instalado**           |  ✅ **Sí**   | El sistema de notificaciones está instalado y se usa en la app.               |
| **Variables .env configuradas**      |  ✅ **Sí**   | El archivo `.env` contiene las variables para Firebase y otros servicios.     |

### 2.3. Código Clave Actual

Estos son los fragmentos de código más relevantes que definen la arquitectura actual.

#### `src/lib/firebase.ts` (Configuración de Firebase)

```typescript
// src/lib/firebase.ts
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import * as admin from 'firebase-admin';
import firebaseConfig from '@/firebase/config';

// Client-side Firebase
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);

// Server-side Firebase Admin
if (!admin.apps.length) {
  try {
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    };
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (e) {
    console.error('Firebase admin initialization error', e);
  }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
```

#### `src/components/AdminGuard.tsx` (Protección de Rutas)

```typescript
"use client";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, getIdTokenResult } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Loader2, ChefHat } from "lucide-react";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [allow, setAllow] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/admin/login");
        return;
      }

      try {
        // Forzar la actualización del token para obtener los claims más recientes.
        const tokenResult = await getIdTokenResult(user, true);
        const isAdmin = tokenResult.claims.admin === true;

        if (isAdmin) {
          setAllow(true);
        } else {
           console.error("Acceso denegado. El usuario no es administrador.");
           await auth.signOut();
           router.push("/admin/login");
        }
      } catch (error) {
        console.error("Error verificando el token de administrador:", error);
        router.push("/admin/login");
      }
    });

    return () => unsub();
  }, [router]);

  if (!allow) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-950">
        <div className="flex items-center gap-2 mb-4">
          <ChefHat className="text-primary w-8 h-8" />
          <span className="text-2xl font-black tracking-tighter">
            Buen<span className="text-primary">Corte</span>
          </span>
        </div>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">
          Verificando credenciales...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
```

#### `src/app/admin/login/page.tsx` (Login de Admin)

```typescript
"use client";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, LogIn, Eye, EyeOff } from "lucide-react";

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-950 to-black p-4">
      <Card className="w-full max-w-md bg-card/70 backdrop-blur-sm border-white/10">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-black">Acceso Administrativo</CardTitle>
          <CardDescription>Ingresa tus credenciales para gestionar BuenCorte.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={login} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@buencorte.co" required />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Contraseña</Label>
                <a href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors">¿Olvidaste tu contraseña?</a>
              </div>
              <div className="relative">
                <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full h-12 text-base font-bold" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin" /> : <> <LogIn className="mr-2"/> Ingresar al Panel</>}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

#### `src/app/admin/dashboard/page.tsx` (Dashboard de Admin)

```typescript
"use client";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import AdminGuard from "@/components/AdminGuard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingBag, ArrowRight } from "lucide-react";

export default function Dashboard() {
  const { toast } = useToast();

  async function logout() {
    await signOut(auth);
    toast({ type: "info", message: "Sesión finalizada" });
  }

  return (
    <AdminGuard>
      <div className="p-4 md:p-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-black text-foreground">Panel administrador</h1>
            <p className="text-muted-foreground mt-1">Gestiona tu negocio desde un solo lugar.</p>
          </div>
          <Button onClick={logout} variant="destructive">Cerrar sesión</Button>
        </div>

        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Productos
                <Package className="text-muted-foreground" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/admin/products">
                  Gestionar Productos
                  <ArrowRight className="ml-2"/>
                </Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Pedidos
                <ShoppingBag className="text-muted-foreground" />
              </CardTitle>
            </CardHeader>
            <CardContent>
               <Button asChild className="w-full" disabled>
                <Link href="/admin/orders">
                  Ver Pedidos
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminGuard>
  );
}
```

#### `src/components/ui/toast.tsx` (Sistema de Notificaciones)

```typescript
'use client';
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
} from 'react';
// ... (el código del sistema de Toast es bastante extenso, pero está implementado y funciona)
```

#### `src/app/admin/products/page.tsx` (Página para CRUD de Productos)

> Este es el archivo donde se integrará la lógica para listar, editar y eliminar productos, consumiendo los endpoints de la API.

### 2.4. Objetivo Exacto del Proyecto

El objetivo principal es tener un panel de administración 100% funcional que permita gestionar el catálogo de productos. El siguiente paso crucial es **conectar el catálogo del frontend público a Firestore para que los productos que se muestran sean los gestionados desde el panel de admin**, y no los datos mock.

En resumen: **"Terminar el panel de admin y conectar el catálogo público a Firestore."**

### 2.5. Método de Despliegue

- [x] Vercel
- [ ] Firebase Hosting
- [ ] Local por ahora

**Proyecto en Vercel:** Sí, el proyecto está configurado para desplegarse en Vercel.

### 2.6. Estructura de Datos de Productos (`products` collection)

Esta es la estructura de datos que se usa en la aplicación y se guardará en Firestore para cada producto.

```json
{
  "id": "firestore-auto-id",
  "name": "Tomahawk King",
  "category": "Res",
  "pricePerKg": 125000,
  "stock": 5,
  "images": [
    {
      "src": "https://url-de-la-imagen.com/img.png",
      "alt": "Descripción de la imagen",
      "aiHint": "tomahawk steak"
    }
  ],
  "rating": 4.9,
  "reviews": 128,
  "details": {
    "origen": "Angus (USA)",
    "maduracion": "30 días",
    "grasa": "Marmoleo A5",
    "corte": "Corte grueso con hueso de la costilla..."
  },
  "pairing": "Malbec Reserva",
  "badge": "Premium",
  "createdAt": "ISO 8601 Timestamp"
}
```

### 2.7. Definición de Atributos del Producto

- [x] **Múltiples fotos**: Sí, el modelo de datos soporta un array de imágenes.
- [x] **Maridaje**: Sí, el campo `pairing` está incluido.
- [x] **Ficha técnica**: Sí, a través del objeto anidado `details`.
- [x] **Termómetro de cocción**: Sí, es una funcionalidad del frontend, no requiere campo en DB.
- [x] **Reviews**: Sí, los campos `rating` y `reviews` están incluidos.
- [x] **Badge (etiqueta)**: Sí, el campo `badge` está incluido.
- [x] **Variantes (peso)**: Sí, se gestiona en el frontend, no requiere campo en DB.
- [x] **SKU único**: No, actualmente se usa el ID de Firestore, lo cual es suficiente.

---

Este diagnóstico exhaustivo nos da una base sólida para continuar. Ahora, podemos proceder con total claridad.

# 📘 Documentación Maestra: El Buen Corte (V2)

Este documento sirve como la fuente única de verdad para la arquitectura, flujos y operación del sistema **El Buen Corte**.

---

## 1. 🏗️ Arquitectura del Sistema

El proyecto opera bajo una arquitectura **Serverless** moderna, diseñada para escalabilidad infinita y costo cero en reposo.

### Stack Tecnológico
-   **Frontend & API**: [Next.js 15 (App Router)](https://nextjs.org) - React Server Components.
-   **Estilos**: [Tailwind CSS](https://tailwindcss.com) + [Shadcn/UI](https://ui.shadcn.com).
-   **Base de Datos**: [Firebase Firestore](https://firebase.google.com/docs/firestore) (NoSQL en tiempo real).
-   **Autenticación**: [Firebase Auth](https://firebase.google.com/docs/auth).
-   **Emails**: [Resend](https://resend.com) (Transaccional).

### Estructura de Directorios Clave
```
src/
├── app/
│   ├── (public)/          # Rutas públicas (Tienda, Carrito, Blog)
│   ├── admin/             # Rutas protegidas (Dashboard, Pedidos, Productos)
│   └── api/               # Endpoints Serverless (Orders, Config, Search)
├── components/
│   ├── dashboard/         # Gráficos y Widgets Admin
│   ├── ui/                # Sistema de Diseño de base
│   └── SalesBotV2.tsx     # "Asistente Contextual" (Optimización de Conversión)
├── lib/
│   ├── firebase/          # Configuración de Admin y Cliente
│   ├── salesbot-engine.ts # Lógica de comportamiento del Bot
│   └── config.ts          # Integración con el CMS Dinámico
```

---

## 2. 🔐 Manual de Seguridad

La seguridad se maneja bajo el principio de **Zero Trust**.

### Autenticación Administrativa (`AdminGuard`)
Todas las rutas bajo `/admin/*` están protegidas por el componente `src/components/AdminGuard.tsx`.
-   **Verificación Centralizada**: Utiliza `src/lib/auth-server.ts` para validar Custom Claims (`admin: true`) en cada petición al servidor.
-   **Seguridad Raíz**: Solo el administrador principal puede otorgar nuevos permisos administrativos.
-   **Sanitización**: Todas las entradas de clientes pasan por un motor de limpieza XSS ligero antes de su persistencia.

### Reglas de Acceso a Datos (`firestore.rules`)
Las reglas definen quién puede leer/escribir:
-   **Público**:
    -   `products`: Lectura libre (Catálogo).
    -   `general_config`: Lectura libre (Footer).
    -   `orders`: Creación libre (Cualquiera puede comprar).
-   **Privado (Solo Admin)**:
    -   `orders`: Lectura/Edición.
    -   `general_config`: Edición.
    -   `users`: Control total.

---

## 3. ⚙️ Manual de Operación (CMS)

### Editar Información del Sitio (Footer)
Para cambiar el teléfono, dirección o redes sociales sin tocar código:
1.  Inicie sesión en `/admin/dashboard`.
2.  Haga clic en la tarjeta **Configuración**.
3.  Edite los campos deseados.
4.  Haga clic en **Guardar Cambios**.
5.  *Efecto*: Se actualiza inmediatamente para todos los usuarios.

### Gestión de Productos
1.  Vaya a `/admin/dashboard` -> **Gestionar Productos**.
2.  Use el botón "Crear Producto" para añadir cortes.
3.  **Ficha Técnica**: Cada producto cuenta con campos para Origen, Maduración, Grasa y Maridaje, editables individualmente.

### Gestión de Pedidos y Trazabilidad
Ubicado en `/admin/orders`.
1.  **Estados**: Cambie el estado con persistencia inmediata y registro del responsable.
2.  **Seguimiento Público**: Los clientes pueden consultar su estado mediante una URL segura de sólo lectura, sin exponer datos privados.

### Moderación de Experiencias
Ubicado en `/admin/experiences`.
1.  **Comentarios**: Sistema de aprobación previa para evitar SPAM o contenido ofensivo.
2.  **Solicitudes**: Gestión de peticiones de experiencias personalizadas.
3.  **Blacklist**: Capacidad de banear IPs por comportamiento abusivo en tiempo real.

---

## 4. 🧠 Inteligencia Artificial y Ventas

### SalesBot V2 ("Asistente Contextual")
Un sistema inteligente que mejora la experiencia del cliente en tiempo real.
-   **Detección de Interés**: Si el usuario analiza un producto prolongadamente, el asistente ofrece contexto relevante.
-   **Recordatorio de Sesión**: Ayuda al usuario a retomar su selección si regresa al portal.
-   **Disponibilidad Crítica**: Informa proactivamente sobre inventarios bajos para agilizar la decisión.

### Dashboard en Vivo
Panel de control para ver el pulso del negocio.
-   **Gráficos**: Ventas diarias y productos más vendidos.
-   **Tiempo Real**: No requiere recargar la página (F5).

---

## 5. 📧 Flujo de Email Transaccional

1.  Usuario completa Checkout en Web.
2.  `api/orders/create` valida datos con Zod.
3.  Se guarda la orden en Firestore y retorna "Éxito" al usuario.
4.  **En segundo plano (Fire-and-Forget)**: Se llama a `Lib/email.ts`.
5.  Resend envía el correo HTML al cliente.

---

## 7. 📄 Contenido y SEO

### Blog & Experiencias
Fusionados en la ruta `/blog` para una mejor navegación. Contiene artículos sobre el arte de la parrilla y memorias de eventos exclusivos.

### Marco Legal
Páginas `/terms` y `/privacy` diseñadas con un tono corporativo profundo y tipografía serif para transmitir confianza legal. Incluye cláusulas específicas para bienes perecederos.

---

*Documento generado automáticamente por el Equipo de Desarrollo - Edición Final Diciembre 2025*

# 🏗️ El Buen Corte: Documentación de Arquitectura (MANDATO-FILTRO)

## 1. Visión General
Una plataforma de e-commerce de alta carnicería diseñada bajo los principios de **Ingeniería de Grado Experto**, priorizando la seguridad proactiva, la UX inteligente y el control operativo total.

## 2. Pila Tecnológica
- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS (Design System).
- **Backend/DB**: Firebase Firestore (ACID Transactions), Firebase Auth (Hardened).
- **Infraestructura Edge**: Upstash Redis (Rate Limiting & Blacklisting), Vercel OG (Dynamic Meta).
- **IA/Búsqueda**: Fuse.js (Semantic Search), Genkit (Future SalesBot).

## 3. Capas de Seguridad (Búnker)
1.  **Transporte**: HTTPS + Strict Security Headers.
2.  **Middleware**: Bloqueo de IP vía Redis (Honeypot Triggered).
3.  **API**: Validación Zod estricta + Sanitización de entradas.
4.  **Base de Datos**: Firestore Rules con validación de esquema y protección IDOR.

## 4. Funcionalidades "Elite"
- **Honeypot**: Atrapa bots silenciosamente.
- **Fuzzy Search**: Búsqueda por intención y etiquetas.
- **Command Palette**: Interfaz Ctrl+K para usuarios avanzados.
- **Feature Flags**: Control remoto vía Firebase Remote Config.
- **SEO JSON-LD**: Visibilidad mejorada en buscadores.

## 5. Estrategia de Calidad (QA Fortress)
- **Unit Tests**: Lógica de precios y validaciones.
- **Integration Tests**: API Endpoints y Side-effects.
- **E2E Tests**: Flujo de compra completo robotizado con Playwright.

---
*Documentación generada automáticamente bajo el protocolo MANDATO-FILTRO.*

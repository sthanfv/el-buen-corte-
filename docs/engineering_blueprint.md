# 🏗️ Blueprint de Ingeniería: El Buen Corte 🛡️🏛️

Este documento resume los pilares tecnológicos de nivel **Senior Fullstack** implementados en el proyecto, diseñados para superar cualquier auditoría técnica o defensa académica ("Laureada").

## 1. Integridad de Datos (MANDATO-FILTRO)
### **Transacciones Atómicas (ACID)**
**Problema:** Condiciones de carrera (Race Conditions) en compras concurrentes.
**Solución:** Implementación de `adminDb.runTransaction` en el flujo de creación de pedidos.
- **Atomicidad:** Toda la operación (descuento de stock + creación de orden) ocurre o no ocurre.
- **Consistencia:** El stock nunca queda en negativo. El sistema verifica el inventario *dentro* del candado de la transacción.
- **Aislamiento:** Otras lecturas/escrituras esperan a que la transacción culmine.

## 2. Arquitectura Orientada a Eventos (Decoupling)
**Problema:** Latencia en la interfaz si el servidor hace demasiadas tareas síncronas.
**Solución:** Patrón de Desacoplamiento en `events-handler.ts`.
- La API responde en milisegundos confirmando la recepción del pedido.
- Los efectos secundarios (Envío de Email vía Resend, Logs de Auditoría, Notificaciones) se ejecutan en segundo plano, garantizando una UX fluida.

## 3. DevOps & Ciclo de Vida (CI/CD)
**Problema:** Riesgo de subir código con errores o sin estándar.
**Solución:** Pipeline de despliegue profesional.
- **Husky & Lint-staged:** Bloqueo de commits si no pasan el filtro de ESLint (Calidad).
- **GitHub Actions:** Ejecución automatizada de tests de integración para el cálculo de precios.
- **Protected Main:** Rama principal blindada para despliegues solo tras validación exitosa.

## 4. Observabilidad y Auditoría Forense
**Problema:** "Cajas negras" donde no se sabe por qué falló algo en producción.
**Solución:** Sistema de Logs Estructurados.
- Cada acción crítica (Baneo de IP, Transición de Estado, Error de Pago) se persiste en Firestore con metadatos contextuales (IP, UID, Timestamp).
- Pestaña de **System Logs** para monitoreo en tiempo real por parte del administrador.

## 5. Experiencia de Usuario (Advanced UX)
**Problema:** Interfaz lenta o poco reactiva.
**Solución:** **Optimistic UI**.
- Al interactuar con el carrito o productos, la interfaz se actualiza al instante. El sistema gestiona las reversiones automáticamente si el servidor reporta un error (Rollback).

---
*Este proyecto no es una tienda simple; es una plataforma robusta, segura y escalable que aplica los estándares más exigentes de la industria actual.*

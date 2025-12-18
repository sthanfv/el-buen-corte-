# 🚀 Hoja de Ruta: La Evolución de "El Buen Corte"
**Estrategia:** Inteligencia de Ventas & Automatización (Sin Costos Fijos)

Este documento reemplaza la estrategia tradicional por un enfoque agresivo basado en **Datos y Comportamiento del Usuario**.

---

## 🧠 FASE 1: "El Cerebro" (Lo que tú ves)
*Objetivo: Entender qué pasa en tu negocio HOY.*

### 1. Dashboard Analítico "Vivo" (Prioridad Máxima)
No más "listas planas". Necesitamos un Centro de Comando en `/admin/dashboard`.
- **Tecnología**: Recharts + Firebase Listeners (Tiempo Real).
- **Métricas Clave**:
    - 🔴 **Actividad Ahora**: "¿Cuánta gente está viendo carne ahora mismo?"
    - 📈 **Ranking de Cortes**: "¿El Tomahawk se vende más que la Picanha?"
    - 🕒 **Horas Calientes**: "¿A qué hora compran más?"

### 2. Notificaciones Automáticas (Email)
Cierre del ciclo de venta profesional sin costo.
- **Flujo**: Pedido realizado -> Email inmediato al cliente y alerta a tu WhatsApp.
- **Herramienta**: Resend.com (Gratis hasta 3000 emails/mes).

---

## 👁️ FASE 2: Personalización Contextual (Asistente de Navegación)
*Objetivo: Mejorar la conversión mediante sugerencias basadas en la sesión activa.*

> "Un asistente que ofrece contexto relevante basándose únicamente en la navegación actual del usuario."

### Funcionamiento Técnico
1.  **Analítica de Sesión Activa**:
    - No requiere registro. Basado en **Métricas de Interacción** en tiempo real para ofrecer una experiencia personalizada durante la visita.
    - *Ejemplo*: "Un visitante ha mostrado interés recurrente en la sección de Cerdo; el asistente puede ofrecer información sobre disponibilidad de costillas".

2.  **Motor de Recomendación (El Algoritmo)**:
    - Si el usuario duda (mueve el mouse erráticamente o hace scroll arriba/abajo), el Bot activa un "empujón".
    - *Acción*: Muestra un banner sutil: "🔥 Las Costillas que ves se están agotando. Solo quedan 2 kgs."

3.  **Memoria Temporal**:
    - Si el usuario vuelve mañana, el sitio **lo recuerda**: "Hola de nuevo. ¿Sigues interesado en el Tomahawk?".

**Requerimientos del Desarrollador (Yo)**:
- Implementar **Firebase Analytics** customizado o una tabla de `user_events` en Firestore.
- Crear lógica de "Event Listeners" (Mouse, Scroll, Click).

---

## 🚀 FASE 3: Fidelización & Escala
*Objetivo: Retención masiva.*

### 1. PWA (Progressive Web App)
- Convertir la web en una App instalable en Android/iOS sin pasar por las tiendas.
- Permite enviar **Notificaciones Push**: "Llegó carne fresca hoy".

### 2. Marketing de "Funnels" (Embudos)
- En lugar de "Recetas", creamos **Guías de Compra**.
- *Ejemplo*: "¿Parrillada para 4? Aquí tienes el pack exacto". Botón de compra directa.

---

### 🚫 Descartado / Pospuesto
- **Pasarelas de Pago Bancarias**: Se descartan por costos/comisiones. Se mantiene el modelo eficiente de "Pedido Web -> Cierre WhatsApp".

---

### Resumen Técnico para Inversión
> "El Buen Corte optimiza la conversión mediante un **Asistente Contextual** que analiza el comportamiento de navegación en tiempo real para personalizar la oferta de manera ética, utilizando analítica de sesión para mejorar la experiencia del usuario sin comprometer datos personales identificables."

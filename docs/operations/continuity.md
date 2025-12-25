# Plan de Continuidad del Negocio (PLANDO DE EMERGENCIA)
**Versión:** 1.0 (Diciembre 2024)  
**Objetivo:** Garantizar que "El Buen Corte" pueda seguir operando y vendiendo incluso ante fallas críticas de infraestructura digital.

## 🆘 Nivel 1: Fallo de Frontend / API
Si la web no carga o el carrito falla:
1. **WhatsApp Directo:** Promover el número alterno de respaldo `+57 311 311 4357` en redes sociales.
2. **Toma Manual:** El operario debe pedir:
   - Nombre y Dirección.
   - Fotos de los productos deseados del catálogo físico/PDF.
   - Comprobante de pago (Nequi/Bancolombia).

## 🆘 Nivel 2: Fallo de Base de Datos (Firestore)
Si no se pueden registrar pedidos digitalmente:
1. **Protocolo Papel/Digital Local:** Usar una hoja de cálculo (Google Sheets en modo offline o Excel) para registrar:
   - ID de Pedido (Manual: `BKP-001`, `BKP-002`...).
   - Cliente y Teléfono.
   - Productos y Peso.
   - Estado de Pago.
2. **Export Backup:** Semanalmente se debe exportar un CSV de productos y precios para tener referencia offline.

## 🆘 Nivel 3: Fallo de Conectividad (Sin Internet en el Local)
1. **Modo Solo Efectivo:** Si el datafono o la verificación de Nequi fallan por red, se prioriza el pago en efectivo contra entrega para clientes recurrentes.
2. **Despacho Ciego:** Se imprimen las rutas de entrega desde el celular (usando datos móviles) para que el domiciliario pueda completar las entregas del día.

---

## 📋 Checklist de Emergencia

| Recurso | Backup | Ubicación |
| :--- | :--- | :--- |
| Catálogo de Precios | PDF / Impreso | Oficina Admin |
| Base de Clientes | Último CSV del mes | Google Drive Offline |
| Comunicación | WhatsApp Business (Celular del Dueño) | Celular Físico |
| Formas de Pago | Efectivo / QR Físico impreso | Punto de Venta |

---

> [!IMPORTANT]
> En caso de desastre digital, la REGLA DE ORO es: **"Primero se sirve al cliente, luego se arregla el sistema"**. El registro en Firestore puede hacerse retroactivamente una vez se restablezca el servicio.

# Checklist de Blindaje Legal y Facturación (DIAN)

Este documento detalla los pasos necesarios para cumplir con la normativa de facturación electrónica en Colombia para "El Buen Corte".

## 🛠️ Requerimientos Técnicos (Implementados)
- [x] Soporte para campos NIT / Empresa en el formulario de pedido.
- [x] Estados de factura en el FSM de órdenes (`INVOICE_PENDING`, `INVOICE_ISSUED`, `INVOICE_REJECTED`).
- [x] Trazabilidad de creación de pedido con IP y UserAgent para auditoría.

## ⚖️ Acción Legal Requerida (FASE 6)

### 1. Auditoría Contable DIAN-Tech
Se debe contratar un contador especializado en tecnología o una plataforma de facturación (e.g., Alegra, Siigo, Loggro) para validar los siguientes puntos:
- [ ] **Factura Global**: Validación de cómo consolidar ventas pequeñas en una factura global diaria si no se solicita factura individual.
- [ ] **Resolución de Facturación**: Asegurar que los rangos numéricos estén configurados correctamente en el sistema de emisión.
- [ ] **Escenarios Prohibidos**: Identificar productos o tipos de venta que requieran manejo especial de IVA (Cárnicos suelen estar exentos o excluidos, verificar estatuto tributario).

### 2. Certificación de Software
- [ ] Solicitar documento firmado por el contador certificando que el flujo de datos del software cumple con los requisitos mínimos de reporte.

### 3. Integración API DIAN (Próxima Fase)
- [ ] Definir el proveedor tecnológico (Provider) para el envío automático de XML a la DIAN.
- [ ] Mapear errores de rechazo DIAN al estado `INVOICE_REJECTED` para corrección manual.

---

> [!IMPORTANT]
> El software actual facilita la recolección de datos, pero la validez legal depende de la sincronización con un Proveedor Tecnológico autorizado por la DIAN.

import { test, expect } from '@playwright/test';

/**
 * E2E Test: Purchase Flow Validation
 * Robotiza el flujo de compra completo:
 * 1. Home -> 2. Selección Tomahawk -> 3. Carrito -> 4. Formulario -> 5. Éxito
 * Protocolo: MANDATO-FILTRO.
 */

test('Flujo de compra completo y creación de orden', async ({ page }) => {
    // 1. Ir a la Home
    await page.goto('http://localhost:9002');

    // 2. Esperar a que carguen los productos (Skeletons out)
    await expect(page.locator('h3').first()).toBeVisible();

    // 3. Buscar y agregar Tomahawk
    const tomahawkCard = page.locator('h3', { hasText: 'Tomahawk' }).locator('..');
    await tomahawkCard.getByRole('button', { name: /Agregar/i }).click();

    // 4. Abrir Carrito y proceder
    await page.getByRole('button', { name: /Ver Pedido/i }).click();
    await page.getByRole('button', { name: /Completar Pedido/i }).click();

    // 5. Llenar Formulario de Entrega
    await page.fill('input[placeholder*="Nombre"]', 'Robot Tester');
    await page.fill('input[placeholder*="WhatsApp"]', '3000000000');
    await page.fill('input[placeholder*="Dirección"]', 'Calle 123 Prueba E2E');
    await page.selectOption('select', 'transferencia');

    // 6. Enviar Pedido
    await page.getByRole('button', { name: /Confirmar mi Pedido/i }).click();

    // 7. Verificar pantalla de éxito
    await expect(page.locator('text=¡Pedido Recibido!')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Estado: CREATED')).toBeVisible();

    console.log('✅ E2E: Flujo de compra validado satisfactoriamente.');
});

test('Navegación experta vía Command Palette (Ctrl+K)', async ({ page }) => {
    await page.goto('http://localhost:9002');

    // Simular presionar Ctrl+K
    await page.keyboard.press('Control+k');

    // Verificar que el diálogo de comandos esté visible
    const commandDialog = page.locator('[role="dialog"]');
    await expect(commandDialog).toBeVisible();

    // Buscar "Admin" en la paleta
    await page.fill('input[placeholder*="Escribe un comando"]', 'Admin');

    // Seleccionar la opción de Dashboard
    await page.getByText(/Dashboard Administrativo/i).click();

    // Verificar redirección
    await expect(page).toHaveURL(/.*\/admin\/login|.*\/admin\/orders/);

    console.log('✅ E2E: Navegación por Command Palette validada.');
});

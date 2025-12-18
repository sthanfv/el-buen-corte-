/**
 * Feature Flags System: El Buen Corte
 * 
 * Allows enabling/disabling features dynamically.
 * In a real-world scenario, these could be fetched from a DB or Config Service.
 */

export const FEATURES = {
    // SalesBot toggles
    salesBotV2: true,

    // UI Experiments
    showQuickCheckout: true,

    // Backend Integrations
    sendEmailConfirmations: true,

    // Performance
    enableApiCaching: true,
} as const;

export type FeatureKey = keyof typeof FEATURES;

export function isFeatureEnabled(key: FeatureKey): boolean {
    return FEATURES[key] ?? false;
}

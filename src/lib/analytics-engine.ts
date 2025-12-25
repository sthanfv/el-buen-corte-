import { adminDb } from './firebase';
import { startOfMonth, format, parseISO, differenceInDays } from 'date-fns';

export interface CohortData {
  month: string;
  size: number;
  retention: { [months_later: number]: number };
}

export interface CustomerMetrics {
  ltv: number;
  orderCount: number;
  lastOrderDays: number;
  avgCycleDays: number;
}

/**
 * Motor de Analítica: El Buen Corte
 * Calcula Cohortes de Retención y LTV basado en el historial de pedidos.
 * Sigue protocolo MANDATO-FILTRO.
 */
export async function calculateRetentionAnalytics() {
  const ordersSnapshot = await adminDb
    .collection('orders')
    .where('status', 'in', ['confirmed', 'preparing', 'delivered'])
    .orderBy('createdAt', 'asc')
    .get();

  const orders = ordersSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as any[];

  const cohorts: { [month: string]: Set<string> } = {};
  const firstPurchase: { [email: string]: string } = {};
  const customerRetention: {
    [month: string]: { [months_later: number]: Set<string> };
  } = {};

  orders.forEach((order) => {
    const email =
      order.customerInfo?.customerEmail || order.customerIp || 'anon'; // Fallback a IP si no hay email
    const date = parseISO(order.createdAt);
    const monthKey = format(startOfMonth(date), 'yyyy-MM');

    if (!firstPurchase[email]) {
      firstPurchase[email] = monthKey;
      if (!cohorts[monthKey]) cohorts[monthKey] = new Set();
      cohorts[monthKey].add(email);
    } else {
      const startMonth = parseISO(firstPurchase[email] + '-01');
      const diffMonths = Math.floor(differenceInDays(date, startMonth) / 30);

      if (diffMonths > 0) {
        if (!customerRetention[firstPurchase[email]]) {
          customerRetention[firstPurchase[email]] = {};
        }
        if (!customerRetention[firstPurchase[email]][diffMonths]) {
          customerRetention[firstPurchase[email]][diffMonths] = new Set();
        }
        customerRetention[firstPurchase[email]][diffMonths].add(email);
      }
    }
  });

  const retentionMatrix: CohortData[] = Object.keys(cohorts).map((month) => {
    const row: CohortData = {
      month,
      size: cohorts[month].size,
      retention: {},
    };

    const laterData = customerRetention[month] || {};
    Object.keys(laterData).forEach((months_later) => {
      const m = parseInt(months_later);
      row.retention[m] = (laterData[m].size / row.size) * 100;
    });

    return row;
  });

  return retentionMatrix;
}

export async function calculateCustomerLTV() {
  const ordersSnapshot = await adminDb
    .collection('orders')
    .where('status', 'in', ['confirmed', 'preparing', 'delivered'])
    .get();

  const metrics: { [email: string]: CustomerMetrics } = {};
  const now = new Date();

  ordersSnapshot.docs.forEach((doc) => {
    const data = doc.data();
    const email = data.customerInfo?.customerEmail || data.customerIp || 'anon';
    const total = data.total || 0;
    const date = parseISO(data.createdAt);

    if (!metrics[email]) {
      metrics[email] = {
        ltv: 0,
        orderCount: 0,
        lastOrderDays: 0,
        avgCycleDays: 0,
      };
    }

    metrics[email].ltv += total;
    metrics[email].orderCount += 1;

    const daysSince = differenceInDays(now, date);
    if (
      metrics[email].orderCount === 1 ||
      daysSince < metrics[email].lastOrderDays
    ) {
      metrics[email].lastOrderDays = daysSince;
    }
  });

  return metrics;
}

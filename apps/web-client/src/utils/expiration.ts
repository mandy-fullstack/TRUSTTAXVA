/**
 * Utilidades para validar fechas de expiración (licencia, pasaporte).
 * Detecta si están expiradas o próximas a expirar.
 */

const DAYS_SOON = 90; // Aviso cuando falten ≤ 90 días

export type ExpirationStatus = 'expired' | 'soon' | 'ok';

export interface ExpirationInfo {
    status: ExpirationStatus;
    daysLeft: number | null;
    dateStr: string;
}

/**
 * Parsea fecha YYYY-MM-DD y devuelve info de expiración.
 */
export function getExpirationInfo(dateStr: string): ExpirationInfo | null {
    if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return null;

    const exp = new Date(dateStr);
    if (isNaN(exp.getTime())) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    exp.setHours(0, 0, 0, 0);

    const diffMs = exp.getTime() - today.getTime();
    const daysLeft = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    let status: ExpirationStatus = 'ok';
    if (daysLeft < 0) status = 'expired';
    else if (daysLeft <= DAYS_SOON) status = 'soon';

    return { status, daysLeft, dateStr };
}

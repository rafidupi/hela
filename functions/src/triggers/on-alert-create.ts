import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { logger } from 'firebase-functions/v2';

/**
 * Trigger: nueva alerta. Responsabilidades:
 *
 * 1. Enviar push (FCM) a los supervisores asignados al site de la alerta.
 * 2. Registrar en una bitácora de auditoría.
 * 3. Si la severidad es critical → llamar a un webhook (integración futura
 *    con ACHS / jefe de turno por SMS).
 *
 * TODO: implementar FCM. Por ahora solo log.
 */
export const onAlertCreate = onDocumentCreated(
  {
    document: 'alerts/{alertId}',
    region: 'southamerica-east1',
  },
  async (event) => {
    const data = event.data?.data();
    if (!data) return;
    logger.info('alert created', {
      id: event.params.alertId,
      type: data.type,
      severity: data.severity,
      siteId: data.siteId,
      workerId: data.workerId,
    });
  },
);

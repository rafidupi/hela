import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { logger } from 'firebase-functions/v2';

/**
 * Trigger: nueva muestra de telemetría. Responsabilidades:
 *
 * 1. Evaluar geocercas — disparar alertas GEOFENCE_ENTER/EXIT si corresponde.
 * 2. Acumular exposición — si el punto está dentro de una geocerca de
 *    exposición, incrementa el contador diario del trabajador.
 * 3. Detectar inmovilidad prolongada — si la velocidad es 0 por N minutos.
 *
 * TODO: implementar. Por ahora solo logueamos para verificar el wiring.
 */
export const onTelemetryWrite = onDocumentCreated(
  {
    document: 'helmets/{helmetId}/telemetry/{sampleId}',
    region: 'southamerica-east1',
  },
  async (event) => {
    const data = event.data?.data();
    if (!data) return;
    logger.debug('telemetry ingested', {
      helmetId: event.params.helmetId,
      workerId: data.workerId,
      ts: data.timestamp,
    });
  },
);

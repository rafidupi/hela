import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { logger } from 'firebase-functions/v2';

/**
 * Trigger: nueva foto. Responsabilidad: generar thumbnail WebP y persistir el
 * path en `thumbnailPath`. TODO: usar sharp() sobre el archivo en Storage.
 */
export const onPhotoCreate = onDocumentCreated(
  {
    document: 'photos/{photoId}',
    region: 'southamerica-east1',
  },
  async (event) => {
    const data = event.data?.data();
    if (!data) return;
    logger.debug('photo registered', {
      id: event.params.photoId,
      workerId: data.workerId,
      storagePath: data.storagePath,
    });
  },
);

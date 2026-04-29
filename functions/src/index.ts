/**
 * Punto de entrada de Cloud Functions. Cada trigger exportado acá se registra
 * en Firebase al desplegar. Mantener el archivo delgado — la lógica vive en
 * submódulos por triger.
 */
export { onTelemetryWrite } from './triggers/on-telemetry-write.js';
export { onAlertCreate } from './triggers/on-alert-create.js';
export { onPhotoCreate } from './triggers/on-photo-create.js';

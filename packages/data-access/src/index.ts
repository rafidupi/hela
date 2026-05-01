export * from './interfaces/index.js';
// Los implementadores concretos se importan explícitamente desde
// `@hela/data-access/firebase` para mantener el `index.ts` libre de
// dependencias hacia Firebase (permite swap futuro a Postgres sin
// arrastrar el SDK al bundle del dashboard si no lo quieres).

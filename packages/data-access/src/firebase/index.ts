// Browser-safe entry point. Do NOT export anything from './admin.js' here —
// firebase-admin is Node-only and will break webpack if bundled for the web.
// Admin helpers live under '@hela/data-access/firebase-admin' instead.
export * from './client.js';
export * from './repositories.js';

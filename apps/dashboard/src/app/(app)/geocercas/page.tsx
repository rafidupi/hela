import { ShieldAlert } from 'lucide-react';
import { PlaceholderPage } from '@/components/placeholder-page';

export default function Page() {
  return (
    <PlaceholderPage
      title="Geocercas"
      description="Editor de zonas del rajo, botaderos, chancado, subestaciones. Configuración de umbrales de exposición y severidad por categoría."
      icon={ShieldAlert}
    />
  );
}

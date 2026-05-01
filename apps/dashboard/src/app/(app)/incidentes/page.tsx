import { Clock } from 'lucide-react';
import { PlaceholderPage } from '@/components/placeholder-page';

export default function Page() {
  return (
    <PlaceholderPage
      title="Historial de Incidentes"
      description="Cronología de eventos con video, fotos y posición. Búsqueda por trabajador, turno, severidad. Base para investigación de accidentes."
      icon={Clock}
    />
  );
}

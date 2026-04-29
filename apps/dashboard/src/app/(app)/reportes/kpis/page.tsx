import { BarChart3 } from 'lucide-react';
import { PlaceholderPage } from '@/components/placeholder-page';

export default function Page() {
  return (
    <PlaceholderPage
      title="KPIs del Turno"
      description="Horas-persona en faena, cumplimiento de charlas de 5 minutos, tiempo medio de respuesta SOS, índice de frecuencia de accidentes."
      icon={BarChart3}
    />
  );
}

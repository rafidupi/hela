import { Radar } from 'lucide-react';
import { PlaceholderPage } from '@/components/placeholder-page';

export default function Page() {
  return (
    <PlaceholderPage
      title="Exposición Ocupacional"
      description="Reporte detallado por trabajador y zona: polvo (PREXOR), ruido, altura, alta tensión. Alertas automáticas al superar umbrales del DS 594."
      icon={Radar}
    />
  );
}

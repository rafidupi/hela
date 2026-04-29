import { FileText } from 'lucide-react';
import { PlaceholderPage } from '@/components/placeholder-page';

export default function Page() {
  return (
    <PlaceholderPage
      title="Reporte SERNAGEOMIN"
      description="Generación automática de DIAT / DIEP con evidencia de video y geolocalización. Export PDF/XML firmado."
      icon={FileText}
    />
  );
}

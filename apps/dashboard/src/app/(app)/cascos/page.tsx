import { HardHat } from 'lucide-react';
import { PlaceholderPage } from '@/components/placeholder-page';

export default function Page() {
  return (
    <PlaceholderPage
      title="Cascos"
      description="Inventario de flota Grandtime H1/H8: asignación, batería, firmware, IMEI, última señal. Gestión de mantenimiento preventivo."
      icon={HardHat}
    />
  );
}

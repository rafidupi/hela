import { Cog } from 'lucide-react';
import { PlaceholderPage } from '@/components/placeholder-page';

export default function Page() {
  return (
    <PlaceholderPage
      title="Configuración"
      description="Parámetros del site, integraciones (ACHS, Modular Dispatch), APN celular, proveedor de mapas, idioma."
      icon={Cog}
    />
  );
}

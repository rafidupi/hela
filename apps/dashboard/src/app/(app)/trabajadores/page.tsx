import { Users } from 'lucide-react';
import { PlaceholderPage } from '@/components/placeholder-page';

export default function Page() {
  return (
    <PlaceholderPage
      title="Trabajadores"
      description="Listado completo de personal en faena, con perfil, galería de fotografías, trayectorias diarias y score de riesgo."
      icon={Users}
    />
  );
}

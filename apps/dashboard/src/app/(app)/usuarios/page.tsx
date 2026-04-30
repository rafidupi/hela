import { UserCircle2 } from 'lucide-react';
import { PlaceholderPage } from '@/components/placeholder-page';

export default function Page() {
  return (
    <PlaceholderPage
      title="Usuarios"
      description="Administración de cuentas del dashboard: gerentes, prevencionistas, supervisores. Roles y permisos por faena."
      icon={UserCircle2}
    />
  );
}

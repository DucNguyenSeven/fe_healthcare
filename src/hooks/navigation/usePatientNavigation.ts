import { useRouter, usePathname } from 'next/navigation';
import { navigationItems, PatientNavId } from '@/features/patient/navigation';

export function usePatientNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  const routeMap = navigationItems.reduce<Record<PatientNavId, string>>((acc, item) => {
    acc[item.id] = item.path;
    return acc;
  }, {} as Record<PatientNavId, string>);

  const navigate = (id: PatientNavId) => {
    const route = routeMap[id];
    if (route && route !== pathname) router.push(route);
  };

  const currentId: PatientNavId = (Object.entries(routeMap).find(([, path]) => path === pathname)?.[0] as PatientNavId) || 'dashboard';

  return { navigate, currentId };
}



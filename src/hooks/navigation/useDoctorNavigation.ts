import { useRouter, usePathname } from 'next/navigation';
import { navigationItems } from '@/features/doctor/navigation';
import type { DoctorNavId } from '@/features/doctor/navigation';

export function useDoctorNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  const routeMap = navigationItems.reduce<Record<DoctorNavId, string>>((acc, item) => {
    acc[item.id] = item.path;
    return acc;
  }, {} as Record<DoctorNavId, string>);

  const navigate = (id: DoctorNavId) => {
    const route = routeMap[id];
    if (route && route !== pathname) router.push(route);
  };

  const currentId: DoctorNavId = (Object.entries(routeMap).find(([, path]) => path === pathname)?.[0] as DoctorNavId) || 'dashboard';

  return { navigate, currentId };
}



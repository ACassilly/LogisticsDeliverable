import servicesDataJson from './services.json';
import type { ServiceData, ServiceType } from '@/types';

export const SERVICES_DATA = servicesDataJson as Record<ServiceType, ServiceData>;

export const SERVICE_SLUGS: ServiceType[] = ['ltl', 'ftl', 'intermodal', 'drayage'];

export function getServiceData(slug: string): ServiceData | null {
  if (SERVICE_SLUGS.includes(slug as ServiceType)) {
    return SERVICES_DATA[slug as ServiceType];
  }
  return null;
}

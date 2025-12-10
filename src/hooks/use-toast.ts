import { useToastContext } from '@/components/ui/toast';

export function useToast() {
  const { toast, removeToast } = useToastContext();
  return { toast, removeToast };
}

import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="flex min-h-[70vh] w-full items-center justify-center bg-transparent">
      <div className="flex flex-col space-y-6 items-center">
        <div className="relative">
          <div className="w-16 h-16 bg-primary/20 rounded-full animate-pulse"></div>
          <div className="absolute inset-0 w-16 h-16 bg-primary/40 rounded-full animate-ping"></div>
        </div>
        <div className="space-y-3 text-center">
          <Skeleton className="h-6 w-48 rounded-lg bg-primary/10" />
          <Skeleton className="h-4 w-32 rounded-lg mx-auto bg-primary/5" />
        </div>
      </div>
    </div>
  );
}

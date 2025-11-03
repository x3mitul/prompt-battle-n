import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

export const ImageSkeleton = () => {
  return (
    <Card className="glass overflow-hidden border-2 border-muted/20">
      <Skeleton className="aspect-square w-full" />
      <div className="p-4">
        <Skeleton className="h-10 w-full" />
      </div>
    </Card>
  );
};

export const ImageGridSkeleton = ({ count = 3 }: { count?: number }) => {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ImageSkeleton key={i} />
      ))}
    </div>
  );
};

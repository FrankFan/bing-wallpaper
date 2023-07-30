import { Skeleton } from "../../shadcn-ui/ui/skeleton";

export const SkeletonContainer = () => {
  return (
    <div className="wallpaper_item">
      <Skeleton className="mb-4 h-40 w-full rounded-md bg-gray-300"></Skeleton>
      <Skeleton className="mb-4 h-6  w-1/2 bg-gray-200"></Skeleton>
      <Skeleton className="mb-4 h-6  w-3/4 bg-gray-300"></Skeleton>
      <Skeleton className="mb-4 h-6  w-3/5 bg-gray-200"></Skeleton>
    </div>
  );
};

export const SkeletonList = () => {
  const length = 20;
  const arr = Array.from({ length }, (_, i) => i + 1);
  return (
    <div className="grid grid-cols-2 gap-8 px-14 md:grid-cols-4 md:gap-10 lg:grid-cols-5">
      {arr.map((_, id) => (
        <SkeletonContainer key={id} />
      ))}
    </div>
  );
};

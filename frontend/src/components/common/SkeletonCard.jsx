const SkeletonCard = () => (
  <div className="bg-white rounded-2xl shadow-card border border-primary-50 overflow-hidden animate-pulse">
    <div className="aspect-[4/3] bg-gray-200" />
    <div className="p-4 space-y-3">
      <div className="h-4 bg-gray-200 rounded-lg w-3/4" />
      <div className="h-3 bg-gray-200 rounded-lg w-1/2" />
      <div className="flex gap-3">
        <div className="h-3 bg-gray-200 rounded-lg w-16" />
        <div className="h-3 bg-gray-200 rounded-lg w-16" />
      </div>
      <div className="flex items-center justify-between">
        <div className="h-5 bg-gray-200 rounded-lg w-20" />
        <div className="w-9 h-9 bg-gray-200 rounded-xl" />
      </div>
    </div>
  </div>
);

export const SkeletonGrid = ({ count = 8 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

export const SkeletonRow = () => (
  <div className="bg-white rounded-2xl p-4 shadow-card border border-primary-50 animate-pulse flex gap-4">
    <div className="w-20 h-20 bg-gray-200 rounded-xl flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gray-200 rounded w-1/2" />
      <div className="h-3 bg-gray-200 rounded w-1/3" />
    </div>
    <div className="space-y-2">
      <div className="h-5 bg-gray-200 rounded w-16" />
      <div className="h-8 bg-gray-200 rounded-xl w-20" />
    </div>
  </div>
);

export default SkeletonCard;

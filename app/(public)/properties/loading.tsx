export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <div className="skeleton h-7 w-48 rounded-lg mb-2" />
        <div className="skeleton h-4 w-24 rounded" />
      </div>
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-64 flex-shrink-0">
          <div className="skeleton h-96 rounded-xl" />
        </div>
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden">
              <div className="skeleton h-52 rounded-2xl mb-3" />
              <div className="skeleton h-4 w-3/4 rounded mb-2" />
              <div className="skeleton h-4 w-1/2 rounded mb-2" />
              <div className="skeleton h-4 w-1/3 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

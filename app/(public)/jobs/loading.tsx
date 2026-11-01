export default function JobsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <div className="skeleton h-7 w-52 rounded-lg mb-2" />
        <div className="skeleton h-4 w-28 rounded" />
      </div>
      {/* Filter pills skeleton */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton h-7 w-20 rounded-full" />
        ))}
      </div>
      {/* Job cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="rounded-2xl p-4" style={{ border: "1px solid var(--border)", background: "var(--surface)" }}>
            <div className="flex items-start gap-3 mb-4">
              <div className="skeleton w-11 h-11 rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-3/4 rounded" />
                <div className="skeleton h-3 w-1/2 rounded" />
                <div className="skeleton h-3 w-2/3 rounded" />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="skeleton h-9 flex-1 rounded-xl" />
              <div className="skeleton h-9 flex-1 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

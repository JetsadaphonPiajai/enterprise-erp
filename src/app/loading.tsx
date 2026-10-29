export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-64 bg-slate-200 rounded-lg"></div>
          <div className="h-4 w-96 bg-slate-100 rounded"></div>
        </div>
        <div className="h-9 w-32 bg-slate-200 rounded-lg"></div>
      </div>

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex justify-between items-center">
              <div className="h-3 w-28 bg-slate-200 rounded"></div>
              <div className="w-8 h-8 rounded-lg bg-slate-100"></div>
            </div>
            <div className="h-8 w-36 bg-slate-200 rounded"></div>
            <div className="h-3 w-24 bg-slate-100 rounded"></div>
          </div>
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="h-5 w-48 bg-slate-200 rounded"></div>
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 w-full bg-slate-50 border border-slate-100 rounded-lg flex items-center px-4 justify-between">
              <div className="h-3.5 w-32 bg-slate-200 rounded"></div>
              <div className="h-3.5 w-48 bg-slate-200 rounded"></div>
              <div className="h-3.5 w-20 bg-slate-200 rounded"></div>
              <div className="h-3.5 w-16 bg-slate-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

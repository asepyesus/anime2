export function CardSkeleton() {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="rounded-2xl shimmer" style={{ aspectRatio: "2/3" }} />
      <div className="shimmer rounded-lg h-3.5 w-3/4" />
      <div className="shimmer rounded-lg h-3 w-1/2" />
    </div>
  )
}

export function GridSkeleton({ count = 10, cols = 5 }: { count?: number; cols?: 2|3|4|5|6 }) {
  const cls = {
    2:"grid-cols-2", 3:"grid-cols-2 sm:grid-cols-3",
    4:"grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
    5:"grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5",
    6:"grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6",
  }[cols]
  return (
    <div className={`grid gap-3 sm:gap-4 ${cls}`}>
      {Array.from({ length: count }).map((_, i) => <CardSkeleton key={i} />)}
    </div>
  )
}

export function TextSkeleton({ w = "100%", h = 16 }: { w?: string; h?: number }) {
  return <div className="shimmer rounded-lg" style={{ width: w, height: h }} />
}

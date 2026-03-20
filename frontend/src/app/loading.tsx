import { GridSkeleton } from "@/components/ui/Skeleton"

export default function Loading() {
  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-10">
      <div className="shimmer h-8 w-48 rounded-xl mb-8" />
      <GridSkeleton count={10} cols={5} />
    </div>
  )
}

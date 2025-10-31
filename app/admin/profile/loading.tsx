export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 bg-muted rounded-md animate-pulse" />
        <div className="flex-1">
          <div className="h-8 w-32 bg-muted rounded animate-pulse mb-2" />
          <div className="h-4 w-64 bg-muted rounded animate-pulse" />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <div className="h-96 bg-muted rounded-lg animate-pulse" />
        </div>
        <div className="md:col-span-2">
          <div className="h-96 bg-muted rounded-lg animate-pulse" />
        </div>
        <div className="md:col-span-3">
          <div className="h-48 bg-muted rounded-lg animate-pulse" />
        </div>
      </div>
    </div>
  )
}

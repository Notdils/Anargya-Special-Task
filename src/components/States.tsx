export function Spinner({ label = "Memuat…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-muted" role="status">
      <span className="h-6 w-6 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      {label}
    </div>
  );
}

export function ErrorBox({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="mx-auto my-10 max-w-xl rounded-xl border border-danger/60 bg-danger/10 p-5 text-center text-danger">
      <p>{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-3 rounded-md border border-danger px-4 py-1.5 font-outfit hover:bg-danger hover:text-black">
          Coba lagi
        </button>
      )}
    </div>
  );
}

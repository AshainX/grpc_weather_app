import StreamingIndicator from './StreamingIndicator';

export default function LoadingSpinner() {
  return (
    <section className="mt-10">
      <div className="flex items-center justify-between mb-4">
        <span className="brut-label">Fetching from gRPC…</span>
        <StreamingIndicator status="streaming" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="border-2 border-ink/40 border-dashed h-32 bg-paperLight/50"
            aria-hidden
          />
        ))}
      </div>
    </section>
  );
}

type Status = 'idle' | 'streaming' | 'complete' | 'error';

interface Props {
  status: Status;
  count?: number;
  total?: number;
}

const LABEL: Record<Status, string> = {
  idle: 'IDLE',
  streaming: 'STREAMING',
  complete: 'COMPLETE',
  error: 'ERROR',
};

export default function StreamingIndicator({ status, count, total }: Props) {
  const pulsing = status === 'streaming';
  const dotColor =
    status === 'error' ? '#c44525' :
    status === 'complete' ? '#2a1b12' :
    status === 'streaming' ? '#c44525' :
    '#9b9484';

  return (
    <div className="flex items-center gap-2 brut-label">
      <span
        className={`inline-block w-[7px] h-[7px] rounded-full ${pulsing ? 'animate-pulse-dot' : ''}`}
        style={{ backgroundColor: dotColor }}
      />
      <span>{LABEL[status]}</span>
      {typeof count === 'number' && typeof total === 'number' && status !== 'idle' && (
        <span className="opacity-60">· {count}/{total}</span>
      )}
    </div>
  );
}

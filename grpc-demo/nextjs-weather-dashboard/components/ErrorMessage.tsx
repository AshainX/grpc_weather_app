interface ErrorMessageProps {
  message: string;
}

export default function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div
      role="alert"
      className="brut-card-sm p-4 mt-6 flex items-center gap-3"
      style={{ borderColor: '#c44525', boxShadow: '3px 3px 0 #c44525' }}
    >
      <span
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ backgroundColor: '#c44525' }}
        aria-hidden
      />
      <p className="font-serif italic leading-snug">{message}</p>
    </div>
  );
}

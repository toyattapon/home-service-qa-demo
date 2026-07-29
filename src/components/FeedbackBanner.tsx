export function FeedbackBanner({
  kind = 'error',
  message,
  onDismiss,
}: {
  kind?: 'error' | 'success' | 'info';
  message?: string;
  onDismiss?: () => void;
}) {
  if (!message) return null;
  return (
    <div className={`feedback feedback-${kind}`} role="alert">
      <span>{message}</span>
      {onDismiss && (
        <button type="button" onClick={onDismiss} aria-label="Dismiss message">
          ×
        </button>
      )}
    </div>
  );
}

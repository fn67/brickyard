import { CheckIcon, WarningIcon } from './icons';

export type Toast = 'none' | 'copied' | 'blocked';

export function StatusMessage({ toast, compact }: { toast: Toast; compact?: boolean }) {
  const size = compact ? 14 : 16;
  if (toast === 'copied') {
    return (
      <div className={compact ? 'toast toast-sm' : 'toast'}>
        <CheckIcon size={size} />
        Copied to clipboard
      </div>
    );
  }
  if (toast === 'blocked') {
    return (
      <div className={compact ? 'toast toast-sm toast-danger' : 'toast toast-danger'}>
        <span className="toast-icon">
          <WarningIcon size={size} />
        </span>
        <span>Clipboard blocked. Use Download instead.</span>
      </div>
    );
  }
  return null;
}

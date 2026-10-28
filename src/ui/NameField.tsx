import { MAX_NAME_LENGTH } from '../engine';
import { ShuffleIcon } from './icons';

interface Props {
  value: string;
  /** The placeholder carries the instruction; the label is kept for screen readers only. */
  placeholder: string;
  onChange: (value: string) => void;
  onShuffle: () => void;
  onFocusChange?: (focused: boolean) => void;
}

export function NameField({ value, placeholder, onChange, onShuffle, onFocusChange }: Props) {
  return (
    <section className="name-field" aria-label="Name">
      <label htmlFor="name" className="visually-hidden">
        Enter anything to see your avatar
      </label>
      <div className="name-row">
        <input
          id="name"
          className="name-input"
          type="text"
          value={value}
          maxLength={MAX_NAME_LENGTH}
          placeholder={placeholder}
          spellCheck={false}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => onFocusChange?.(true)}
          onBlur={() => onFocusChange?.(false)}
        />
        <button type="button" className="btn shuffle-btn" onClick={onShuffle}>
          <ShuffleIcon />
          Shuffle
        </button>
      </div>
    </section>
  );
}

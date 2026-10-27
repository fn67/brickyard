import { MAX_NAME_LENGTH } from '../engine';
import { ShuffleIcon } from './icons';

interface Props {
  value: string;
  onChange: (value: string) => void;
  onShuffle: () => void;
  onFocusChange?: (focused: boolean) => void;
}

export function NameField({ value, onChange, onShuffle, onFocusChange }: Props) {
  return (
    <section className="name-field" aria-label="Name">
      <label htmlFor="name" className="field-label name-label">
        Enter anything to see your avatar
      </label>
      <div className="name-row">
        <input
          id="name"
          className="name-input"
          type="text"
          value={value}
          maxLength={MAX_NAME_LENGTH}
          placeholder="Username, name or any string"
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

import { CubeIcon } from './icons';
import { Segmented } from './Segmented';
import type { View } from './useAvatarState';

interface Props {
  view: View;
  can3d: boolean;
  onChange: (view: View) => void;
  /** id of the note that explains why 3D is off. */
  noteId: string;
  compact?: boolean;
}

export function ModeSwitch({ view, can3d, onChange, noteId, compact }: Props) {
  return (
    <Segmented
      label="Preview mode"
      className={compact ? 'mode-switch mode-switch-compact' : 'mode-switch'}
      value={view}
      onChange={onChange}
      options={[
        { value: '2d', label: '2D' },
        {
          value: '3d',
          label: (
            <>
              <CubeIcon size={compact ? 14 : 15} strokeWidth={compact ? 2 : 1.9} />
              3D
            </>
          ),
          disabled: !can3d,
          describedBy: can3d ? undefined : noteId,
        },
      ]}
    />
  );
}

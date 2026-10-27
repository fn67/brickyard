import { CubeIcon } from './icons';
import { Segmented } from './Segmented';
import type { View } from './useAvatarState';

interface Props {
  view: View;
  can3d: boolean;
  onChange: (view: View) => void;
  /** id of the note that explains why 3D is off. */
  noteId: string;
}

export function ModeSwitch({ view, can3d, onChange, noteId }: Props) {
  return (
    <Segmented
      label="Preview mode"
      className="mode-switch"
      value={view}
      onChange={onChange}
      options={[
        { value: '2d', label: '2D' },
        {
          value: '3d',
          label: (
            <>
              <CubeIcon />
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

import { ColourControl } from './ColourControl';
import { StyleGrid } from './StyleGrid';
import type { AvatarState } from './useAvatarState';
import { Variations } from './Variations';

export function StylesPanel({ state }: { state: AvatarState }) {
  return (
    <section className="panel styles-panel" aria-label="Styles">
      <h2 className="panel-title">Styles</h2>
      <div className="colour-row">
        <ColourControl hue={state.hue} onChange={state.setHue} />
      </div>
      <StyleGrid name={state.name} style={state.style} hue={state.hue} background={state.background} onPick={state.setStyle} />
      <div className="variations-section">
        <Variations
          name={state.name}
          names={state.variations}
          variation={state.variation}
          style={state.style}
          hue={state.hue}
          background={state.background}
          onPick={state.setField}
          onUseOriginal={state.useOriginal}
        />
      </div>
    </section>
  );
}

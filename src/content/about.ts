// All text for the About dialog, in the order it is shown. Edit the wording here only.
// There is deliberately no "Private by design" section (see docs/TASKS.md, Stage 11).

/** A run of text, or a short piece shown as a mono chip (for example `hello-world:3`). */
export type Inline = string | { code: string };

export interface AboutStep {
  /** The bold lead word, shown before the text. */
  lead: string;
  text: string;
  /** Show the "left half, mirrored" drawing under this step. */
  diagram?: boolean;
}

export interface AboutSection {
  heading: string;
  /** A bold line under the heading, before the steps. */
  lead?: string;
  paragraphs?: Inline[][];
  steps?: AboutStep[];
}

export const ABOUT = {
  title: 'What is Brickyard?',
  close: 'Close',
  intro: [
    'Brickyard turns any name into a pixel avatar. Type a username, a name or any string, pick a style, and you get a small face made of blocks. It’s for people who hate profile pictures.',
  ] as Inline[],
  diagram: { left: 'Left half', right: 'Mirrored' },
  sections: [
    {
      heading: 'Same name, same face',
      paragraphs: [
        [
          'Nothing is random. The same text gives the same avatar every time, on any device. Change the colour, background or view and the pattern stays put. Only a different name, or a different variation, changes it.',
        ],
      ],
    },
    {
      heading: 'What you can do',
      paragraphs: [['Choose from ten styles, change the colour and background, copy or download a PNG, and view Critter in 3D.']],
    },
    {
      heading: 'How it works',
      lead: 'From text to face, in four steps',
      steps: [
        {
          lead: 'Hash.',
          text: 'Your text is turned into one fixed-size number (32 bits). Even a tiny change in the text gives a completely different number.',
        },
        {
          lead: 'Seeded random numbers.',
          text: 'That number starts a random number generator. It is not true randomness: given the same starting number it produces the same sequence every time. That’s why the same name always gives the same avatar.',
        },
        {
          lead: 'Fill half the grid.',
          text: 'The sequence decides which cells are filled in the left half of the grid. The right half is a mirror image. Symmetry is what makes the blocks read as a face or a creature instead of noise.',
          diagram: true,
        },
        {
          lead: 'Colour.',
          text: 'The colour comes from the same number, using fixed brightness and saturation ranges so every avatar stays readable and none are muddy. Choosing a colour overrides the hue only.',
        },
      ],
    },
    {
      heading: 'Why each style looks different',
      paragraphs: [
        [
          'Each style adds its own “salt” to the number before generating, so it follows its own pattern rules. A name that’s a friendly Classic can be a different character as Invader or Quilt, but the 5×5 styles share the same underlying pattern, so it still feels like the same person in different outfits.',
        ],
      ],
    },
    {
      heading: 'Variations',
      paragraphs: [
        [
          'The six variations add a number to your text (for example ',
          { code: 'hello-world:3' },
          ') and run the same steps, so each is a repeatable alternative.',
        ],
      ],
    },
    {
      heading: 'How unique is it?',
      paragraphs: [
        [
          // The engine gives 30,537 distinct 5×5 shapes (tests/about.test.ts); the design said about 32,000.
          'Not perfectly. A 5×5 mirrored grid has only about 30,500 possible shapes, and colour multiplies that, so different names can occasionally end up looking alike. It is built to be consistent and recognisable, not to be a fingerprint.',
        ],
      ],
    },
    {
      heading: 'Why blocks?',
      paragraphs: [
        [
          'Because the grid is small and symmetrical, the result is simple, readable at 20 pixels, and easy to turn into a 3D model out of plain blocks.',
        ],
      ],
    },
  ] as AboutSection[],
};

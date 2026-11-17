import { ChapterData, CardData } from '../types';

export const CHAPTERS: ChapterData[] = [
  {
    id: 'the-place',
    number: '01',
    eyebrow: 'THE ARRIVAL',
    line1: 'Somewhere beyond.',
    line2: 'Closer to yourself.',
    supporting: 'A secluded desert retreat shaped by sandstone, silence, and light. Space to slow down. Room to simply be.',
    cta: {
      label: 'Explore Serra',
      targetChapter: 'the-stay',
      type: 'explore'
    }
  },
  {
    id: 'the-stay',
    number: '02',
    eyebrow: 'INTO THE LANDSCAPE',
    line1: 'Carved by time.',
    line2: 'Made for stillness.',
    supporting: 'Follow the canyon inward to private stone suites, quiet pools, and open skies. Every detail belongs to the landscape.',
    cta: {
      label: 'The journey continues',
      targetChapter: 'experiences',
      type: 'continue'
    }
  },
  {
    id: 'experiences',
    number: '03',
    eyebrow: 'BEYOND THE EXPECTED',
    line1: 'A little further.',
    line2: 'A little quieter.',
    supporting: 'Beyond the water, the sanctuary unfolds. Follow the light into private spaces, warm stone, and a quieter kind of luxury.'
  },
  {
    id: 'the-horizon',
    number: '04',
    eyebrow: 'ROOM TO BREATHE',
    line1: 'A world apart.',
    line2: 'A place within.',
    supporting: 'The canyon opens. The horizon stretches. An intimate sanctuary, and a slower way to see the world.',
    cta: {
      label: 'Return to the beginning',
      targetChapter: 'the-place',
      type: 'return'
    }
  }
];

export const CARDS: CardData[] = [
  {
    id: 'card-stay',
    kicker: 'THE STAY',
    title: 'Stay within stone',
    body: 'Private canyon suites, natural textures, and terraces opening onto the quiet of the desert.',
    icon: 'waves'
  },
  {
    id: 'card-experience',
    kicker: 'THE EXPERIENCE',
    title: 'Find your rhythm',
    body: 'Sunrise walks, mineral bathing, and dinners beneath an uninterrupted sky.',
    icon: 'sun'
  }
];

export const DESTINATIONS = [
  { id: 'the-place', label: 'The Place', subtitle: 'A sanctuary within stone', p: 0 },
  { id: 'the-stay', label: 'The Stay', subtitle: 'Space to simply be', p: 0.29 },
  { id: 'experiences', label: 'Experiences', subtitle: 'Beyond the expected', p: 0.59 },
  { id: 'the-horizon', label: 'The Horizon', subtitle: 'A world opening up', p: 1.0 }
];

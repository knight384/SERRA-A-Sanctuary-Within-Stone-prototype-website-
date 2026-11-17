export type QualitySetting = 'auto' | '1080p' | '720p';

export interface ChapterData {
  id: string;
  number: string;
  eyebrow: string;
  line1: string;
  line2: string;
  supporting: string;
  cta?: {
    label: string;
    targetChapter: string;
    type: 'explore' | 'continue' | 'return';
  };
}

export interface CardData {
  id: string;
  kicker: string;
  title: string;
  body: string;
  icon: 'waves' | 'sun';
}

export interface MediaManifest {
  openingPoster: string;
  mobileOpeningPoster: string;
  poolPoster: string;
  interiorPoster: string;
  horizonPoster: string;
  depthAtlas: string;
  desktopVideo: string;
  mobileVideo: string;
}

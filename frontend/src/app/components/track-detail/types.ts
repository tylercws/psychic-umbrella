export interface Cue {
  id: string;
  label: string;
  time: string;
  color: string;
  type?: "point" | "range";
  startTime?: number;
  endTime?: number;
  duration?: number;
}

export interface MixPoints {
  intro_end?: number | string;
  drop?: number | string;
  outro_start?: number | string;
}

export interface TrackDescriptors {
  mood?: string;
  dynamic_range?: string | number;
  contrast?: string | number;
}

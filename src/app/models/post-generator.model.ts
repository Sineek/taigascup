export interface RankState {
  nick: string;
  img: HTMLImageElement | null;
  imageName: string | null;
  zoom: number;
  x: number;
  y: number;
}

export interface GeneratorState {
  edition: number;
  wheelTitle: 'edition' | 'extra';
  wheel: HTMLImageElement | null;
  wheelName: string | null;
  wheelZoom: number;
  wheelX: number;
  wheelY: number;
  top4: RankState[];
}

export interface RankSlot {
  y: number;
  h: number;
  x: number;
  w: number;
  nameX: number;
  nameY: number;
  font: number;
  maxW: number;
}

export function createInitialState(): GeneratorState {
  return {
    edition: 29,
    wheelTitle: 'edition',
    wheel: null,
    wheelName: null,
    wheelZoom: 100,
    wheelX: 0,
    wheelY: 0,
    top4: Array.from({ length: 4 }, () => ({
      nick: '',
      img: null,
      imageName: null,
      zoom: 100,
      x: 0,
      y: 0,
    })),
  };
}


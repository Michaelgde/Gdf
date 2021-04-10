declare namespace PIXI.filters {
  import PIXI = GlobalPIXIModule.PIXI;
  export class ColorOverlayFilter extends PIXI.Filter {
    constructor(color?: number | [number, number, number]);
    color: number | [number, number, number];
  }
}

declare module '@pixi/filter-color-overlay' {
  export import ColorOverlayFilter = PIXI.filters.ColorOverlayFilter;
}

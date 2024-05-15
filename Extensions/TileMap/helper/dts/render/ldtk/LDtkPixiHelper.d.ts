import { TileTextureCache } from '../TileTextureCache';
import { LDtkTileMap } from '../../load/ldtk/LDtkFormat';
export declare namespace LDtkPixiHelper {
  /**
   * Split an atlas image into Pixi textures.
   *
   * @param tileMap A tile map exported from LDtk.
   * @param levelIndex The level of the tile map to load from.
   * @param atlasTexture The texture containing the whole tile set.
   * @param getTexture A getter to load a texture.
   * @returns A textures cache.
   */
  function parseAtlas(
    tileMap: LDtkTileMap,
    levelIndex: number,
    atlasTexture: PIXI.Texture | null,
    getTexture: (textureName: string) => PIXI.Texture
  ): TileTextureCache | null;
}
//# sourceMappingURL=LDtkPixiHelper.d.ts.map

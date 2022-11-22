import { integer } from "../../model/CommonTypes";
import { EditableTileMap, TileDefinition } from "../../model/Model";
import { LDtkTileMap } from "./Format";
import { getLDtkTileId, getPixiRotateFromLDtk } from "./LoaderHelper";

export namespace LDtkTileMapLoader {
  export function load(pako: any, tileMap: LDtkTileMap): EditableTileMap | null {
    const levelIndex = 0;
    const level = tileMap.levels[levelIndex > -1 ? levelIndex : 0];
    if (!level || !level.layerInstances) {
      return null;
    }
    
    const tileSet = new Map<integer, TileDefinition>();
    let gridSize = 0;
    let dimX = 0;
    let dimY = 0;
    
    for(let iLayer = level.layerInstances.length - 1; iLayer >= 0; --iLayer) {
      const layer = level.layerInstances[iLayer];
      const tilesetId = layer.__tilesetDefUid;
      const tileCache: Record<number, boolean> = {};
      
      for(const tile of [...layer.autoLayerTiles, ...layer.gridTiles]) {
        if(tileCache[tile.t]) {
          continue;
        }
        
        const tileId = getLDtkTileId(tilesetId, tile.t);
        if(tileSet.has(tileId)) {
          tileCache[tile.t] = true;
          continue;
        }
        
        const tileDef = new TileDefinition(0);
        
        tileCache[tile.t] = true;
        tileSet.set(tileId, tileDef);
      }
      
      if(gridSize === 0 && layer.__type === "IntGrid") {
        gridSize = layer.__gridSize;
        dimX = layer.__cWid;
        dimY = layer.__cHei;
      }
    }
    
    const editableTileMap = new EditableTileMap(
      gridSize,
      gridSize,
      dimX,
      dimY,
      tileSet,
    );
    
    for(let iLayer = level.layerInstances.length - 1; iLayer >= 0; --iLayer) {
      const layer = level.layerInstances[iLayer];
      const alpha = layer.__opacity;
      const gridSize = layer.__gridSize;
      const tilesetId = layer.__tilesetDefUid;
      
      const editableTileLayer = editableTileMap.addTileLayer(iLayer);
      editableTileLayer.setVisible(layer.visible);
      
      for(const tile of [...layer.autoLayerTiles, ...layer.gridTiles]) {
        const x = tile.px[0] / gridSize;
        const y = tile.px[1] / gridSize;
        const tileId = getLDtkTileId(tilesetId, tile.t);
        
        editableTileLayer.addTile(x, y, {
          tileId,
          alpha,
          rotate: getPixiRotateFromLDtk(tile.f),
          flippedDiagonally: tile.f === 3,
          flippedHorizontally: tile.f === 1,
          flippedVertically: tile.f === 2,
        });
      }
    }
    
    return editableTileMap;
  }
}

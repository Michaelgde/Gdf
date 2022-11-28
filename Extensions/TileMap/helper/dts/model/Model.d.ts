import { PolygonVertices, integer, float } from "../types/commons";
export type EditableTile = {
    tileId: integer;
    rotate: integer;
    flippedHorizontally: boolean;
    flippedVertically: boolean;
    flippedDiagonally: boolean;
};
/**
 * A tile map model.
 *
 * Tile map files are parsed into this model by {@link TiledTileMapLoader}.
 * This model is used for rending ({@link TileMapRuntimeObjectPixiRenderer})
 * and hitboxes handling ({@link TransformedCollisionTileMap}).
 * This allows to support new file format with only a new parser.
 */
export declare class EditableTileMap {
    private _backgroundResourceName?;
    private _layers;
    private _tileSet;
    /**
     * The width of a tile.
     */
    private readonly tileWidth;
    /**
     * The height of a tile.
     */
    private readonly tileHeight;
    /**
     * The number of tile columns in the map.
     */
    private readonly dimX;
    /**
     * The number of tile rows in the map.
     */
    private readonly dimY;
    /**
     * @param tileWidth The width of a tile.
     * @param tileHeight The height of a tile.
     * @param dimX The number of tile columns in the map.
     * @param dimY The number of tile rows in the map.
     * @param tileSet The tile set.
     */
    constructor(tileWidth: integer, tileHeight: integer, dimX: integer, dimY: integer, tileSet: Map<integer, TileDefinition>);
    /**
     * @param id The identifier of the new layer.
     * @returns The new layer.
     */
    addObjectLayer(id: integer): EditableObjectLayer;
    /**
     * @param id The identifier of the new layer.
     * @returns The new layer.
     */
    addTileLayer(id: integer): EditableTileMapLayer;
    /**
     * @returns The resource name of the background
     */
    getBackgroundResourceName(): string;
    /**
     * @returns The number of tile columns in the map.
     */
    getDimensionX(): integer;
    /**
     * @returns The number of tile rows in the map.
     */
    getDimensionY(): integer;
    /**
     * @returns The tile map height in pixels.
     */
    getHeight(): integer;
    /**
     * @returns All the layers of the tile map.
     */
    getLayers(): Iterable<AbstractEditableLayer>;
    /**
     * @param tileId The tile identifier
     * @returns The tile definition form the tile set.
     */
    getTileDefinition(tileId: integer): TileDefinition | undefined;
    /**
     * @returns All the tile definitions form the tile set.
     */
    getTileDefinitions(): Iterable<TileDefinition>;
    /**
     * @returns The tile width in pixels.
     */
    getTileHeight(): integer;
    /**
     * @returns The tile height in pixels.
     */
    getTileWidth(): integer;
    /**
     * @returns The tile map width in pixels.
     */
    getWidth(): integer;
    /**
     * Check if a point is inside a tile with a given tag.
     *
     * It doesn't use the tile hitboxes.
     * It only check the point is inside the tile square.
     *
     * @param x The X coordinate of the point to check.
     * @param y The Y coordinate of the point to check.
     * @param tag The tile tag
     * @returns true when the point is inside a tile with a given tag.
     */
    pointIsInsideTile(x: float, y: float, tag: string): boolean;
    /**
     * @param resourceName The name of the resource
     */
    setBackgroundResourceName(resourceName: string): void;
}
/**
 * A tile map layer.
 */
declare abstract class AbstractEditableLayer {
    /**
     * The layer tile map.
     */
    readonly tileMap: EditableTileMap;
    /**
     * The layer identifier.
     */
    readonly id: integer;
    private visible;
    /**
     * @param tileMap The layer tile map.
     * @param id The layer identifier.
     */
    constructor(tileMap: EditableTileMap, id: integer);
    setVisible(visible: boolean): void;
    /**
     * @returns true if the layer is visible.
     */
    isVisible(): boolean;
}
/**
 * A layer where tiles are placed with pixel coordinates.
 */
export declare class EditableObjectLayer extends AbstractEditableLayer {
    readonly objects: TileObject[];
    /**
     * @param tileMap  The layer tile map.
     * @param id The layer identifier.
     */
    constructor(tileMap: EditableTileMap, id: integer);
    add(object: TileObject): void;
}
/**
 * A tile that is placed with pixel coordinates.
 */
export type TileObject = {
    /**
     * The tile identifier in the tile set.
     */
    readonly tileId: integer;
    /**
     * The coordinate of the tile left side.
     */
    readonly x: float;
    /**
     * The coordinate of the tile top side.
     */
    readonly y: float;
    /**
     * the Pixi's rotate
     */
    readonly rotate: integer;
};
/**
 * A tile map layer with tile organized in grid.
 */
export declare class EditableTileMapLayer extends AbstractEditableLayer {
    private readonly _tiles;
    private _alpha;
    /**
     * @param tileMap The layer tile map.
     * @param id The layer identifier.
     */
    constructor(tileMap: EditableTileMap, id: integer);
    /**
     * @param x The layer column.
     * @param y The layer row.
     * @param tile The tile.
     */
    addTile(x: integer, y: integer, tile: EditableTile): void;
    /**
     * The opacity (between 0-1) of the layer
     */
    getAlpha(): float;
    /**
     * The number of tile columns in the layer.
     */
    getDimensionX(): integer;
    /**
     * The number of tile rows in the layer.
     */
    getDimensionY(): integer;
    /**
     * @returns The layer height in pixels.
     */
    getHeight(): integer;
    /**
     * @param x The layer column.
     * @param y The layer row.
     * @returns The tile.
     */
    getTile(x: integer, y: integer): EditableTile | undefined;
    /**
     * @param x The layer column.
     * @param y The layer row.
     * @returns The stacked tiles.
     */
    getTiles(x: integer, y: integer): EditableTile[] | undefined;
    /**
     * @returns The layer width in pixels.
     */
    getWidth(): integer;
    /**
     * @param x The layer column.
     * @param y The layer row.
     * @returns true if the tile is flipped horizontally.
     */
    isFlippedHorizontally(x: integer, y: integer): boolean;
    /**
     * @param x The layer column.
     * @param y The layer row.
     * @returns true if the tile is flipped vertically.
     */
    isFlippedVertically(x: integer, y: integer): boolean;
    /**
     * @param x The layer column.
     * @param y The layer row.
     * @returns true if the tile is flipped diagonally.
     */
    isFlippedDiagonally(x: integer, y: integer): boolean;
    /**
     * @param x The layer column.
     * @param y The layer row.
     */
    removeTile(x: integer, y: integer): void;
    /**
     * @param alpha The opacity between 0-1
     */
    setAlpha(alpha: float): void;
    /**
     * @param x The layer column.
     * @param y The layer row.
     * @param tile The tile.
     */
    setTile(x: integer, y: integer, tile: EditableTile): void;
}
/**
 * A tile definition from the tile set.
 */
export declare class TileDefinition {
    /**
     * There will probably be at most 4 tags on a tile.
     * An array lookup should take less time than using a Map.
     */
    private readonly taggedHitBoxes;
    private readonly animationLength;
    /**
     * @param animationLength The number of frame in the tile animation.
     */
    constructor(animationLength: integer);
    /**
     * Add a polygon for the collision layer
     * @param tag The tag to allow collision layer filtering.
     * @param polygon The polygon to use for collisions.
     */
    add(tag: string, polygon: PolygonVertices): void;
    /**
     * This property is used by {@link TransformedCollisionTileMap}
     * to make collision classes.
     * @param tag  The tag to allow collision layer filtering.
     * @returns true if this tile contains any polygon with the given tag.
     */
    hasTag(tag: string): boolean;
    /**
     * The hitboxes positioning is done by {@link TransformedCollisionTileMap}.
     * @param tag  The tag to allow collision layer filtering.
     * @returns The hit boxes for this tile.
     */
    getHitBoxes(tag: string): PolygonVertices[] | undefined;
    /**
     * Animated tiles have a limitation:
     * they are only able to use frames arranged horizontally one next
     * to each other on the atlas.
     * @returns The number of frame in the tile animation.
     */
    getAnimationLength(): integer;
}
export {};
//# sourceMappingURL=Model.d.ts.map
// @flow
import * as React from 'react';
import { List } from 'react-virtualized';
import ItemRow from './ItemRow';
import { AddListItem } from '../ListCommonItem';
import { listItemWith32PxIconHeight, listItemWithoutIconHeight } from '../List';
import { makeDragSourceAndDropTarget } from '../DragAndDrop/DragSourceAndDropTarget';
import DropIndicator from './DropIndicator';
import { ResponsiveWindowMeasurer } from '../Reponsive/ResponsiveWindowMeasurer';
import { ScreenTypeMeasurer } from '../Reponsive/ScreenTypeMeasurer';
import type { WidthType } from '../Reponsive/ResponsiveWindowMeasurer';
import { type HTMLDataset } from '../../Utils/HTMLDataset';
import { type DraggedItem } from '../../UI/DragAndDrop/CustomDragLayer';

type Props<Item> = {|
  height: number,
  width: number,
  fullList: Array<Item>,
  selectedItems: Array<Item>,
  onAddNewItem?: () => void,
  addNewItemLabel?: React.Node | string,
  addNewItemId?: string,
  onRename: (Item, string) => void,
  renderItemLabel?: Item => React.Node,
  getItemName: Item => string,
  getItemThumbnail?: Item => string,
  getItemId?: (Item, index: number) => string,
  getItemData?: (Item, index: number) => HTMLDataset,
  isItemBold?: Item => boolean,
  onItemSelected: (?Item) => void,
  onEditItem?: Item => void,
  renamedItem: ?Item,
  erroredItems?: { [string]: '' | 'error' | 'warning' },
  buildMenuTemplate: (Item, index: number) => any,
  onMoveSelectionToItem: (destinationItem: Item) => void,
  canMoveSelectionToItem?: ?(destinationItem: Item) => boolean,
  scaleUpItemIconWhenSelected?: boolean,
  reactDndType: string,
|};

export default class SortableVirtualizedItemList<Item> extends React.Component<
  Props<Item>
> {
  _list: ?List;
  DragSourceAndDropTarget = makeDragSourceAndDropTarget<Item>(
    this.props.reactDndType
  );

  forceUpdateGrid() {
    if (this._list) this._list.forceUpdateGrid();
  }

  scrollToItem(item: Item) {
    const index = this.props.fullList.findIndex(
      listItem =>
        this.props.getItemName(listItem) === this.props.getItemName(item)
    );
    if (this._list && index !== -1) {
      this._list.scrollToRow(index);
    }
  }

  _renderItemRow(
    item: Item,
    index: number,
    windowWidth: WidthType,
    connectIconDragSource?: ?(React.Element<any>) => ?React.Node
  ) {
    const {
      selectedItems,
      getItemThumbnail,
      erroredItems,
      isItemBold,
      onEditItem,
      renamedItem,
      getItemName,
      getItemId,
      getItemData,
      renderItemLabel,
      scaleUpItemIconWhenSelected,
    } = this.props;

    const nameBeingEdited = renamedItem === item;
    const itemName = getItemName(item);

    return (
      <ItemRow
        item={item}
        itemName={itemName}
        id={getItemId ? getItemId(item, index) : undefined}
        data={getItemData ? getItemData(item, index) : undefined}
        renderItemLabel={
          renderItemLabel ? () => renderItemLabel(item) : undefined
        }
        isBold={isItemBold ? isItemBold(item) : false}
        onRename={newName => this.props.onRename(item, newName)}
        editingName={nameBeingEdited}
        getThumbnail={
          getItemThumbnail ? () => getItemThumbnail(item) : undefined
        }
        selected={selectedItems.indexOf(item) !== -1}
        onItemSelected={this.props.onItemSelected}
        errorStatus={erroredItems ? erroredItems[itemName] || '' : ''}
        buildMenuTemplate={() => this.props.buildMenuTemplate(item, index)}
        onEdit={onEditItem}
        hideMenuButton={windowWidth === 'small'}
        scaleUpItemIconWhenSelected={scaleUpItemIconWhenSelected}
        connectIconDragSource={connectIconDragSource || null}
      />
    );
  }

  render() {
    const {
      height,
      width,
      fullList,
      addNewItemLabel,
      addNewItemId,
      renamedItem,
      getItemThumbnail,
      getItemName,
      onAddNewItem,
      onMoveSelectionToItem,
      canMoveSelectionToItem,
      selectedItems,
    } = this.props;
    const { DragSourceAndDropTarget } = this;

    // Create an empty pixel image once to override the default drag preview of all items.
    const emptyImage = new Image();
    emptyImage.src =
      'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';

    return (
      <ResponsiveWindowMeasurer>
        {windowWidth => (
          <ScreenTypeMeasurer>
            {screenType => (
              <List
                ref={list => (this._list = list)}
                height={height}
                rowCount={fullList.length + (onAddNewItem ? 1 : 0)}
                rowHeight={
                  getItemThumbnail
                    ? listItemWith32PxIconHeight
                    : listItemWithoutIconHeight
                }
                rowRenderer={({
                  index,
                  key,
                  style,
                }: {|
                  index: number,
                  key: string,
                  style: Object,
                |}) => {
                  if (index >= fullList.length) {
                    return (
                      <div style={style} key={key}>
                        <AddListItem
                          onClick={onAddNewItem}
                          primaryText={width < 200 ? '' : addNewItemLabel}
                          id={addNewItemId}
                        />
                      </div>
                    );
                  }

                  const item = fullList[index];
                  const nameBeingEdited = renamedItem === item;
                  const isSelected = selectedItems.indexOf(item) !== -1;

                  return (
                    <div style={style} key={key}>
                      <DragSourceAndDropTarget
                        beginDrag={() => {
                          // Ensure we reselect the item even if it's already selected.
                          // This prevents a bug where the connected preview is not
                          // updated when the item is already selected.
                          this.props.onItemSelected(item);

                          // We return the item name and thumbnail to be used by the
                          // drag preview. We can't use the item itself because it's
                          // not serializable and breaks react-dnd.
                          const draggedItem: DraggedItem = {
                            name: getItemName(item),
                            thumbnail:
                              this.props.reactDndType ===
                                'GD_OBJECT_WITH_CONTEXT' && getItemThumbnail
                                ? getItemThumbnail(item)
                                : undefined,
                          };
                          // $FlowFixMe
                          return draggedItem;
                        }}
                        canDrag={() => !nameBeingEdited}
                        canDrop={() =>
                          canMoveSelectionToItem
                            ? canMoveSelectionToItem(item)
                            : true
                        }
                        drop={() => {
                          onMoveSelectionToItem(item);
                        }}
                      >
                        {({
                          connectDragSource,
                          connectDropTarget,
                          connectDragPreview,
                          isOver,
                          canDrop,
                        }) => {
                          // If on a touch screen, setting the whole item to be
                          // draggable would prevent scroll. Set the icon only to be
                          // draggable if the item is not selected. When selected,
                          // set the whole item to be draggable.
                          const canDragOnlyIcon =
                            screenType === 'touch' && !isSelected;

                          // Connect the drag preview with an empty image to override the default
                          // drag preview.
                          connectDragPreview(emptyImage, {
                            captureDraggingState: true,
                          });

                          // Add an extra div because connectDropTarget/connectDragSource can
                          // only be used on native elements
                          const dropTarget = connectDropTarget(
                            <div>
                              {isOver && <DropIndicator canDrop={canDrop} />}
                              {this._renderItemRow(
                                item,
                                index,
                                windowWidth,
                                // Only mark the icon as draggable if needed
                                // (touchscreens).
                                canDragOnlyIcon ? connectDragSource : null
                              )}
                            </div>
                          );

                          if (!dropTarget) return null;

                          return canDragOnlyIcon
                            ? dropTarget
                            : connectDragSource(dropTarget);
                        }}
                      </DragSourceAndDropTarget>
                    </div>
                  );
                }}
                width={width}
              />
            )}
          </ScreenTypeMeasurer>
        )}
      </ResponsiveWindowMeasurer>
    );
  }
}

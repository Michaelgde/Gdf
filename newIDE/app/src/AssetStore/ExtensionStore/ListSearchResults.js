// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import PlaceholderLoader from '../../UI/PlaceholderLoader';
import PlaceholderError from '../../UI/PlaceholderError';
import ErrorBoundary from '../../UI/ErrorBoundary';
import { AutoSizer, Grid } from 'react-virtualized';
import EmptyMessage from '../../UI/EmptyMessage';

type Props<SearchItem> = {|
  searchItems: ?Array<SearchItem>,
  renderSearchItem: (
    item: SearchItem,
    onHeightComputed: (number) => void
  ) => React.Node,
  error: ?Error,
  onRetry: () => void,
|};

const styles = {
  container: { flex: 1 },
  grid: { overflowX: 'hidden' },
};

const ESTIMATED_ROW_HEIGHT = 90;

/** A virtualized list of search results, caching the searched item heights. */
export const ListSearchResults = <SearchItem: { name: string }>({
  searchItems,
  renderSearchItem,
  error,
  onRetry,
}: Props<SearchItem>) => {
  const grid = React.useRef<?Grid>(null);

  // Height of each item is initially unknown. When rendered, the items
  // are reporting their heights and we cache these values.
  const cachedHeightsForWidth = React.useRef(0);
  const cachedHeights = React.useRef({});
  const onItemHeightComputed = React.useCallback((searchItem, height) => {
    if (cachedHeights.current[searchItem.name] === height) return false;

    cachedHeights.current[searchItem.name] = height;
    return true;
  }, []);
  const getRowHeight = React.useCallback(
    ({ index }) => {
      if (!searchItems || !searchItems[index]) return ESTIMATED_ROW_HEIGHT;

      const searchItem = searchItems[index];
      return cachedHeights.current[searchItem.name] || ESTIMATED_ROW_HEIGHT;
    },
    [searchItems]
  );

  // Render an item, and update the cached height when it's reported
  const renderRow = React.useCallback(
    ({ key, rowIndex, style }) => {
      if (!searchItems) return null;

      const searchItem = searchItems[rowIndex];
      if (!searchItem) return null;

      return (
        <div key={key} style={style}>
          {renderSearchItem(searchItem, height => {
            const heightWasUpdated = onItemHeightComputed(searchItem, height);
            if (heightWasUpdated && grid.current) {
              grid.current.recomputeGridSize(0, rowIndex);
            }
          })}
        </div>
      );
    },
    [searchItems, onItemHeightComputed, renderSearchItem]
  );

  if (!searchItems) {
    if (!error) return <PlaceholderLoader />;
    else {
      return (
        <PlaceholderError onRetry={onRetry}>
          <Trans>
            Can't load the results. Verify your internet connection or retry
            later.
          </Trans>
        </PlaceholderError>
      );
    }
  } else if (searchItems.length === 0) {
    return (
      <EmptyMessage>
        <Trans>
          No results returned for your search. Try something else or browse the
          categories.
        </Trans>
      </EmptyMessage>
    );
  }

  return (
    <ErrorBoundary>
      <div style={styles.container}>
        <AutoSizer>
          {({ width, height }) => {
            if (!width || !height) return null;

            // Reset the cached heights in case the width changed.
            if (cachedHeightsForWidth.current !== width) {
              cachedHeights.current = {};
              cachedHeightsForWidth.current = width;
            }

            return (
              <Grid
                ref={grid}
                width={width}
                height={height}
                columnCount={1}
                columnWidth={width}
                rowHeight={getRowHeight}
                rowCount={searchItems.length}
                cellRenderer={renderRow}
                style={styles.grid}
              />
            );
          }}
        </AutoSizer>
      </div>
    </ErrorBoundary>
  );
};

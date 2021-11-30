// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import { makeStyles } from '@material-ui/styles';
import GridList from '@material-ui/core/GridList';
import { GridListTile, Paper } from '@material-ui/core';
import ArrowBackIos from '@material-ui/icons/ArrowBackIos';
import ArrowForwardIos from '@material-ui/icons/ArrowForwardIos';
import { Skeleton } from '@material-ui/lab';

import Window from '../Utils/Window';
import Text from './Text';
import { Column, Line, Spacer } from './Grid';
import GDevelopThemeContext from './Theme/ThemeContext';
import { useResponsiveWindowWidth } from './Reponsive/ResponsiveWindowMeasurer';
import FlatButton, { type Props as FlatButtonProps } from './FlatButton';

type Thumbnail = {|
  id: string,
  title: string,
  description: string,
  thumbnailUrl: string,
  link?: string,
|};

type SkeletonThumbnail = {|
  ...Thumbnail,
  skeleton: boolean,
|};

type Props<ThumbnailType> = {|
  title: React.Node,
  items: ?Array<ThumbnailType>,
  onBrowseAllClick?: () => void,
  browseAllLink?: string,
  displayItemTitles?: boolean,
  tabIndexOffset?: number,
|};

const referenceSizesByWindowSize = {
  imageHeight: {
    small: 130,
    medium: 150,
    large: 180,
  },
  arrowWidth: {
    small: 24,
    medium: 30,
    large: 36,
  },
};

const cellSpacing = 12;
const titleHeight = 30;
const spacerSize = 4;
const rightArrowMargin = 6; // Necessary because MUI adds a -6 margin to GridList

const styles = {
  itemTitle: {
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    overflowWrap: 'break-word',
    whiteSpace: 'nowrap',
  },
  gridList: { position: 'relative' },
  image: {
    objectFit: 'cover',
  },
  itemTitleContainer: { height: titleHeight },
  arrowContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
};

const useStylesForGridList = makeStyles({
  root: {
    overflowX: 'scroll',
    overflowY: 'hidden',
    flexWrap: 'nowrap',
    scrollbarWidth: 'none' /* For Firefox */,
    '-ms-overflow-style': 'none' /* For Internet Explorer and Edge */,
    '&::-webkit-scrollbar': {
      height: 0 /* For Chrome, Safari, and Opera */,
    },
  },
});

const useStylesForGridListItem = makeStyles({
  root: {
    width: 'unset !important',
  },
  tile: {
    display: 'flex',
    flexDirection: 'column',
  },
});

const Carousel = <ThumbnailType: Thumbnail>({
  title,
  items,
  browseAllLink,
  onBrowseAllClick,
  displayItemTitles = true,
  tabIndexOffset = 0,
}: Props<ThumbnailType>) => {
  const theme = React.useContext(GDevelopThemeContext);
  const [
    shouldDisplayLeftArrow,
    setShouldDisplayLeftArrow,
  ] = React.useState<boolean>(false);
  const classesForGridList = useStylesForGridList();
  const classesForGridListItem = useStylesForGridListItem();
  const scrollView = React.useRef<?HTMLUListElement>(null);
  const areItemsSet = items && items.length;
  const itemsToDisplay =
    items && items.length
      ? items
      : Array(3)
          .fill({
            skeleton: true,
            title: '',
            description: '',
            thumbnail: '',
          })
          .map((item, index) => ({ ...item, id: `skeleton${index}` }));

  const windowSize = useResponsiveWindowWidth();
  const imageHeight = referenceSizesByWindowSize.imageHeight[windowSize];
  const arrowWidth = referenceSizesByWindowSize.arrowWidth[windowSize];
  const cellWidth = (16 / 9) * imageHeight;
  const widthUnit = cellWidth + cellSpacing;

  const cellHeight =
    imageHeight + (displayItemTitles ? titleHeight + spacerSize : 0);

  const renderImage = React.useCallback(
    (item: ThumbnailType | SkeletonThumbnail): React.Node => (
      <img
        src={item.thumbnailUrl}
        style={{
          ...styles.image,
          height: imageHeight,
          minHeight: imageHeight,
          width: cellWidth,
        }}
        alt={item.title}
        title={item.title}
      />
    ),
    [cellWidth, imageHeight]
  );

  const renderThumbnail = React.useCallback(
    (item: ThumbnailType | SkeletonThumbnail): ?React.Node => {
      if (!item.skeleton && !item.link && !item.thumbnailUrl) return null;
      if (item.link) {
        return (
          <a href={item.link} target="_blank">
            {renderImage(item)}
          </a>
        );
      }
      if (item.thumbnailUrl) {
        return renderImage(item);
      }
      if (item.skeleton) {
        return (
          <Skeleton variant="rect" height={imageHeight} width={cellWidth} />
        );
      }
    },
    [renderImage, cellWidth, imageHeight]
  );

  const renderItemTitle = React.useCallback(
    (item: ThumbnailType | SkeletonThumbnail): ?React.Node => {
      if (!displayItemTitles) return null;
      return (
        <>
          <Spacer />
          {item.title ? (
            <div style={{ ...styles.itemTitleContainer, width: cellWidth }}>
              <Text noMargin style={styles.itemTitle}>
                {item.title}
              </Text>
            </div>
          ) : (
            <Skeleton
              variant="rect"
              height={titleHeight}
              width={(cellWidth / 3) * (1 + 2 * Math.random())} // Make rectangles of different lengths so that the UI feels more "alive".
            />
          )}
        </>
      );
    },
    [cellWidth, titleHeight]
  );

  const renderBrowseAllButton = (): React.Node => {
    const flatButtonProps: $Shape<FlatButtonProps> = { onClick: () => {} };
    if (!onBrowseAllClick && browseAllLink) {
      flatButtonProps.onClick = () => {
        Window.openExternalURL(browseAllLink);
      };
      flatButtonProps.target = '_blank';
    } else if (onBrowseAllClick) {
      flatButtonProps.onClick = onBrowseAllClick;
    } else {
      flatButtonProps.onClick = () => {};
    }

    return (
      <FlatButton
        {...flatButtonProps}
        label={<Trans>Browse all</Trans>}
        tabIndex={tabIndexOffset + itemsToDisplay.length}
      />
    );
  };

  const computeScroll = React.useCallback(
    (
      direction: 'left' | 'right',
      scrollViewElement: HTMLUListElement
    ): number => {
      const visibleThumbnailsCount = Math.floor(
        scrollViewElement.offsetWidth / widthUnit
      );
      const scale = visibleThumbnailsCount * widthUnit;

      const currentScroll = scrollViewElement.scrollLeft;
      const currentFirstVisibleItemIndex = currentScroll / widthUnit;

      if (
        direction === 'right' &&
        currentFirstVisibleItemIndex >
          itemsToDisplay.length - visibleThumbnailsCount - 1
      )
        return 0;
      return roundScroll(
        scrollViewElement.scrollLeft + scale * (direction === 'left' ? -1 : 1)
      );
    },
    [widthUnit, itemsToDisplay]
  );

  const roundScroll = React.useCallback(
    (value: number): number => {
      return Math.round(value / widthUnit) * widthUnit;
    },
    [widthUnit]
  );

  const onClickArrow = (direction: 'left' | 'right') =>
    React.useCallback(
      (): void => {
        const scrollViewElement = scrollView.current;
        if (!scrollViewElement) return;
        const newScrollPosition = computeScroll(direction, scrollViewElement);

        scrollViewElement.scrollTo({
          left: newScrollPosition,
          behavior: 'smooth',
        });
      },
      [computeScroll]
    );

  const handleScroll = React.useCallback(() => {
    const scrollViewElement = scrollView.current;
    if (!scrollViewElement) return;

    if (!shouldDisplayLeftArrow)
      setShouldDisplayLeftArrow(scrollViewElement.scrollLeft !== 0);
  });
  const handleScrollEnd = React.useCallback(
    () => {
      const scrollViewElement = scrollView.current;
      if (!scrollViewElement) return;

      scrollViewElement.scrollTo({
        left: roundScroll(scrollViewElement.scrollLeft),
        behavior: 'smooth',
      });
    },
    [roundScroll]
  );

  React.useEffect(() => {
    const scrollViewElement = scrollView.current;
    if (!scrollViewElement) return;

    scrollViewElement.addEventListener('scroll', handleScroll);
    scrollViewElement.addEventListener('touchend', handleScrollEnd);
    scrollViewElement.addEventListener('touchleave', handleScrollEnd);
  }, []);

  return (
    <Line noMargin expand>
      <div
        style={{ ...styles.arrowContainer, width: arrowWidth }}
        onClick={onClickArrow('left')}
      >
        {areItemsSet && shouldDisplayLeftArrow && <ArrowBackIos />}
      </div>
      <div
        style={{
          width: `calc(100% - ${2 * arrowWidth}px - ${rightArrowMargin}px)`,
        }}
      >
        <Line noMargin justifyContent="space-between" alignItems="center">
          <Text size="bold-title">{title}</Text>
          {renderBrowseAllButton()}
        </Line>
        <GridList
          classes={classesForGridList}
          cols={itemsToDisplay.length}
          cellHeight={cellHeight}
          spacing={cellSpacing}
          style={styles.gridList}
          ref={scrollView}
        >
          {itemsToDisplay.map((item, index) => (
            <GridListTile
              classes={classesForGridListItem}
              key={item.id}
              tabIndex={areItemsSet ? index + tabIndexOffset : -1}
            >
              {renderThumbnail(item)}
              {renderItemTitle(item)}
            </GridListTile>
          ))}
        </GridList>
      </div>
      {areItemsSet && (
        <div
          style={{
            ...styles.arrowContainer,
            width: arrowWidth,
            marginLeft: rightArrowMargin,
          }}
          onClick={onClickArrow('right')}
        >
          <ArrowForwardIos />
        </div>
      )}
    </Line>
  );
};

export default Carousel;

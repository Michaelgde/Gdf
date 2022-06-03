// @flow
import * as React from 'react';
import { type FiltersState } from '../UI/Search/FiltersChooser';
import {
  type AssetShortHeader,
  type AssetPack,
} from '../Utils/GDevelopServices/Asset';

export type AssetStorePageState = {|
  isOnHomePage: boolean,
  openedAssetPack: ?AssetPack,
  openedAssetShortHeader: ?AssetShortHeader,
  filtersState: FiltersState,
  ignoreTextualSearch: boolean,
|};

export type NavigationState = {|
  previousPages: Array<AssetStorePageState>,
  getCurrentPage: () => AssetStorePageState,
  backToPreviousPage: () => void,
  openHome: () => void,
  openSearchIfNeeded: () => void,
  openTagPage: string => void,
  openPackPage: AssetPack => void,
  openDetailPage: AssetShortHeader => void,
|};

export const assetStoreHomePageState: AssetStorePageState = {
  isOnHomePage: true,
  openedAssetShortHeader: null,
  openedAssetPack: null,
  filtersState: {
    chosenCategory: null,
    chosenFilters: new Set(),
    addFilter: () => {},
    removeFilter: () => {},
    setChosenCategory: () => {},
  },
  ignoreTextualSearch: false,
};

type AssetStorePageHistory = {|
  previousPages: Array<AssetStorePageState>,
|};

export const useNavigation = (): NavigationState => {
  const [history, setHistory] = React.useState<AssetStorePageHistory>({
    previousPages: [assetStoreHomePageState],
  });
  const previousPages = history.previousPages;
  const currentPage = previousPages[previousPages.length - 1];

  return {
    previousPages,
    getCurrentPage: () => currentPage,
    backToPreviousPage: () => {
      if (previousPages.length > 1) {
        previousPages.pop();
        setHistory({ previousPages });
      }
    },
    openHome: () => {
      previousPages.length = 0;
      previousPages.push(assetStoreHomePageState);
      setHistory({ previousPages });
    },
    openSearchIfNeeded: () => {
      if (currentPage.isOnHomePage || currentPage.openedAssetShortHeader) {
        previousPages.push({
          isOnHomePage: false,
          openedAssetShortHeader: null,
          openedAssetPack: null,
          filtersState: {
            chosenCategory: null,
            chosenFilters: new Set(),
            addFilter: () => {},
            removeFilter: () => {},
            setChosenCategory: () => {},
          },
          ignoreTextualSearch: false,
        });
        setHistory({ previousPages });
      }
    },
    openTagPage: (tag: string) => {
      previousPages.push({
        isOnHomePage: false,
        openedAssetShortHeader: null,
        openedAssetPack: null,
        filtersState: {
          chosenCategory: {
            node: { name: tag, allChildrenTags: [], children: [] },
            parentNodes: [],
          },
          chosenFilters: new Set(),
          addFilter: () => {},
          removeFilter: () => {},
          setChosenCategory: () => {},
        },
        ignoreTextualSearch: true,
      });
      setHistory({ previousPages });
    },
    openPackPage: (assetPack: AssetPack) => {
      previousPages.push({
        isOnHomePage: false,
        openedAssetShortHeader: null,
        openedAssetPack: assetPack,
        filtersState: {
          chosenCategory: {
            node: { name: assetPack.tag, allChildrenTags: [], children: [] },
            parentNodes: [],
          },
          chosenFilters: new Set(),
          addFilter: () => {},
          removeFilter: () => {},
          setChosenCategory: () => {},
        },
        ignoreTextualSearch: true,
      });
      setHistory({ previousPages });
    },
    openDetailPage: (assetShortHeader: AssetShortHeader) => {
      previousPages.push({
        isOnHomePage: false,
        openedAssetShortHeader: assetShortHeader,
        openedAssetPack: null,
        filtersState: {
          chosenCategory: null,
          chosenFilters: new Set(),
          addFilter: () => {},
          removeFilter: () => {},
          setChosenCategory: () => {},
        },
        ignoreTextualSearch: true,
      });
      setHistory({ previousPages });
    },
  };
};

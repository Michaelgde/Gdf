type AlgoliaSearchHitHierarchy = {|
  lvl0: string,
  lvl1?: string,
  lvl2?: string,
  lvl3?: string,
  lvl4?: string,
  lvl5?: string,
  lvl6?: string,
|};

export type AlgoliaSearchHit = {|
  content: string | null,
  url: string,
  hierarchy: AlgoliaSearchHitHierarchy,
|};

export const getHierarchyAsArray = (
  hierarchy: AlgoliaSearchHitHierarchy
): Array<string> =>
  Object.entries(hierarchy)
    .reduce((acc, [level, content]) => {
      if (content) {
        acc.push([Number(level.replace('lvl', '')), content]);
      }
      return acc;
    }, [])
    .sort((a, b) => a[0] - b[0])
    // $FlowFixMe[incompatible-return] - Object.entries does not keep values types.
    .map(item => item[1]);

export const getHitLastHierarchyLevel = (hit: AlgoliaSearchHit) => {
  const hierarchyArray = getHierarchyAsArray(hit.hierarchy);
  return hierarchyArray[hierarchyArray.length - 1];
};

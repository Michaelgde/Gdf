// @flow
import * as React from 'react';
import SectionContainer, { SectionRow } from '../SectionContainer';
import {
  type Tutorial,
  type TutorialCategory,
} from '../../../../Utils/GDevelopServices/Tutorial';
import { formatTutorialToWidgetItem, TUTORIAL_CATEGORY_TEXTS } from '.';
import WidgetsGrid from '../../../../UI/WidgetsGrid';
import { type WidthType } from '../../../../UI/Reponsive/ResponsiveWindowMeasurer';

const getColumnsFromWidth = (width: WidthType) => {
  switch (width) {
    case 'small':
      return 1;
    case 'medium':
      return 3;
    case 'large':
    default:
      return 5;
  }
};

type Props = {|
  onBack: () => void,
  tutorials: Array<Tutorial>,
  category: TutorialCategory,
|};

const TutorialsCategoryPage = ({ category, tutorials, onBack }: Props) => {
  const texts = TUTORIAL_CATEGORY_TEXTS[category];
  const filteredTutorials = tutorials.filter(
    tutorial => tutorial.category === category
  );
  return (
    <SectionContainer
      title={texts.title}
      subtitle={texts.description}
      backAction={onBack}
    >
      <SectionRow>
        <WidgetsGrid
          items={filteredTutorials.map(formatTutorialToWidgetItem)}
          getColumnsFromWidth={getColumnsFromWidth}
        />
      </SectionRow>
    </SectionContainer>
  );
};

export default TutorialsCategoryPage;

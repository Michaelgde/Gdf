// @flow

import * as React from 'react';
import UnsavedChangesContext from './UnsavedChangesContext';
import PreferencesContext from './Preferences/PreferencesContext';
import { Trans } from '@lingui/macro';
import InfoBar from '../UI/Messages/InfoBar';
import type { UnsavedChanges } from './UnsavedChangesContext';
import InAppTutorialContext from '../InAppTutorial/InAppTutorialContext';

export type UnsavedChangesAmount = 'none' | 'small' | 'significant' | 'risky';

type Props = {| onSave: () => Promise<void> |};

const ONE_MINUTE = 60 * 1000;
const MINIMUM_CHANGES_FOR_SIGNIFICANT_STATUS = 12;
const MINIMUM_CHANGES_FOR_RISKY_STATUS = 200;
const MAXIMUM_DURATION_FOR_SMALL_STATUS = 5 * ONE_MINUTE;
const MINIMUM_DURATION_FOR_RISKY_STATUS = 20 * ONE_MINUTE;
const DURATION_BETWEEN_TWO_DISPLAYS = 5 * ONE_MINUTE;

const getUnsavedChangesAmount = (
  unsavedChanges: UnsavedChanges
): UnsavedChangesAmount => {
  const { changesCount, lastSaveTime } = unsavedChanges;
  if (changesCount === 0 || !lastSaveTime) return 'none';
  const now = Date.now();
  if (changesCount > MINIMUM_CHANGES_FOR_RISKY_STATUS) return 'risky';
  if (now - lastSaveTime > MINIMUM_DURATION_FOR_RISKY_STATUS) return 'risky';
  else if (now - lastSaveTime < MAXIMUM_DURATION_FOR_SMALL_STATUS)
    return 'small';
  else {
    // Between MAXIMUM_DURATION_FOR_SMALL_STATUS and MINIMUM_DURATION_FOR_RISKY_STATUS without saving.
    if (changesCount <= MINIMUM_CHANGES_FOR_SIGNIFICANT_STATUS) return 'small';
    if (changesCount <= MINIMUM_CHANGES_FOR_RISKY_STATUS) return 'significant';
    return 'risky';
  }
};

const useSaveReminder = ({ onSave }: Props) => {
  const unsavedChanges = React.useContext(UnsavedChangesContext);
  const { currentlyRunningInAppTutorial } = React.useContext(
    InAppTutorialContext
  );
  const {
    values: { displaySaveReminder: displaySaveReminderPreference },
  } = React.useContext(PreferencesContext);
  const [displayReminder, setDisplayReminder] = React.useState<boolean>(false);
  const [lastAcknowledgement, setLastAcknowledgement] = React.useState<
    number | null
  >(null);

  const unsavedChangesAmount = getUnsavedChangesAmount(unsavedChanges);

  React.useEffect(
    () => {
      if (
        !displaySaveReminderPreference.activated ||
        currentlyRunningInAppTutorial
      ) {
        setDisplayReminder(false);
        return;
      }
      const now = Date.now();
      setDisplayReminder(
        unsavedChangesAmount === 'risky' &&
          (!lastAcknowledgement ||
            now - lastAcknowledgement > DURATION_BETWEEN_TWO_DISPLAYS)
      );
    },
    [
      // Necessary dependencies
      displaySaveReminderPreference,
      unsavedChangesAmount,
      lastAcknowledgement,
      currentlyRunningInAppTutorial,
      // Added dependency to have the possibility to show the reminder on each change.
      unsavedChanges.changesCount,
    ]
  );

  const onHideReminder = React.useCallback(() => {
    setLastAcknowledgement(Date.now());
  }, []);

  const renderSaveReminder = () => {
    return (
      <InfoBar
        duration={-1}
        visible={displayReminder}
        message={<Trans>Think about saving your progress!</Trans>}
        hide={onHideReminder}
        actionLabel={<Trans>Save</Trans>}
        onActionClick={onSave}
        closable
      />
    );
  };
  return { renderSaveReminder };
};

export default useSaveReminder;

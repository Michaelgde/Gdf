// @flow
import { t, Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { Card, Chip } from '@material-ui/core';
import * as React from 'react';
import { Column, Line, Spacer } from '../UI/Grid';
import RaisedButton from '../UI/RaisedButton';
import {
  getGameUrl,
  updateGame,
  type Game,
} from '../Utils/GDevelopServices/Game';
import { ResponsiveLineStackLayout } from '../UI/Layout';
import Window from '../Utils/Window';
import { GameThumbnail } from './GameThumbnail';
import FlatButton from '../UI/FlatButton';
import ShareIcon from '@material-ui/icons/Share';
import IconButton from '../UI/IconButton';
import Text from '../UI/Text';
import Toggle from '../UI/Toggle';
import MoreVert from '@material-ui/icons/MoreVert';
import CardContent from '../UI/Card/CardContent';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import CardHeader from '../UI/Card/CardHeader';
import ElementWithMenu from '../UI/Menu/ElementWithMenu';
import { type I18n as I18nType } from '@lingui/core';
import { type GamesDetailsTab } from './GameDetailsDialog';
import { useDebounce } from '../Utils/UseDebounce';
import ShareDialog from './ShareDialog';

type Props = {|
  game: Game,
  isCurrentGame: boolean,
  onOpenGameManager: (tab: GamesDetailsTab) => void,
  onUpdateGame: () => Promise<void>,
|};

const getCurrentState = (gameProperty: ?boolean, pendingState: ?boolean) => {
  return !!(pendingState === null ? gameProperty : pendingState);
};

export const GameCard = ({
  game,
  isCurrentGame,
  onOpenGameManager,
  onUpdateGame,
}: Props) => {
  const openGameUrl = () => {
    const url = getGameUrl(game);
    if (!url) return;
    Window.openExternalURL(url);
  };
  const [showShareDialog, setShowShareDialog] = React.useState(false);
  // Those are pending states that are used to limit the number of requests on toggle.
  const [isDiscoverable, setIsDiscoverable] = React.useState<?boolean>(null);
  const [
    acceptsBuildComments,
    setAcceptsBuildComments,
  ] = React.useState<?boolean>(null);
  const [
    acceptsGameComments,
    setAcceptsGameComments,
  ] = React.useState<?boolean>(null);

  const { getAuthorizationHeader, profile } = React.useContext(
    AuthenticatedUserContext
  );

  const updateGameProperties = useDebounce(async parameters => {
    if (!profile) return;
    await updateGame(getAuthorizationHeader, profile.id, game.id, parameters);
    await onUpdateGame();
    typeof parameters.isDiscoverable === 'boolean' && setIsDiscoverable(null);
    typeof parameters.acceptsBuildComments === 'boolean' &&
      setAcceptsBuildComments(null);
    typeof parameters.acceptsGameComments === 'boolean' &&
      setAcceptsGameComments(null);
  }, 500);

  const onToggleDiscoverable = () => {
    const currentDiscoverableState = getCurrentState(
      game.discoverable,
      isDiscoverable
    );
    setIsDiscoverable(!currentDiscoverableState);
    updateGameProperties({
      discoverable: !currentDiscoverableState,
    });
  };
  const onToggleAcceptsBuildComments = () => {
    const currentAcceptsBuildCommentsState = getCurrentState(
      game.acceptsBuildComments,
      acceptsBuildComments
    );
    setAcceptsBuildComments(!currentAcceptsBuildCommentsState);
    updateGameProperties({
      acceptsBuildComments: !currentAcceptsBuildCommentsState,
    });
  };
  const onToggleAcceptsGameComments = () => {
    const currentAcceptsGameCommentsState = getCurrentState(
      game.acceptsGameComments,
      acceptsGameComments
    );
    setAcceptsGameComments(!currentAcceptsGameCommentsState);
    updateGameProperties({
      acceptsGameComments: !currentAcceptsGameCommentsState,
    });
  };

  return (
    <I18n>
      {({ i18n }) => (
        <>
          <Card key={game.id} variant="outlined">
            <CardContent>
              <Line noMargin justifyContent="space-between" alignItems="center">
                <Line>
                  {game.publicWebBuildId && (
                    <>
                      <Text size="body2" noMargin displayInlineAsSpan>
                        {game.discoverable ? (
                          <Trans>Public on Liluo.io</Trans>
                        ) : (
                          <Trans>
                            Build version only (non visible on Liluo.io)
                          </Trans>
                        )}
                      </Text>
                      <Spacer />
                    </>
                  )}

                  <Text size="body2" noMargin displayInlineAsSpan>
                    <Trans>Created on {i18n.date(game.createdAt * 1000)}</Trans>{' '}
                  </Text>
                </Line>
                <ElementWithMenu
                  element={
                    <IconButton size="small" style={{ padding: 0 }}>
                      <MoreVert />
                    </IconButton>
                  }
                  buildMenuTemplate={(i18n: I18nType) => [
                    {
                      label: i18n._(t`Open details`),
                      click: () => onOpenGameManager('details'),
                    },
                    {
                      label: i18n._(t`Open builds`),
                      click: () => onOpenGameManager('builds'),
                    },
                    {
                      label: i18n._(t`Open analytics`),
                      click: () => onOpenGameManager('analytics'),
                    },
                    {
                      label: i18n._(t`Open leaderboards`),
                      click: () => onOpenGameManager('leaderboards'),
                    },
                  ]}
                />
              </Line>
              <ResponsiveLineStackLayout noMargin>
                <GameThumbnail
                  gameName={game.gameName}
                  thumbnailUrl={game.thumbnailUrl}
                />
                <Spacer />
                <Column expand justifyContent="space-between">
                  <ResponsiveLineStackLayout noMargin alignItems="flex-start">
                    <CardHeader
                      title={game.gameName}
                      subheader={
                        isCurrentGame && (
                          <Chip
                            size="small"
                            label={<Trans>Currently edited</Trans>}
                            color="primary"
                          />
                        )
                      }
                    />
                    <Column expand noMargin>
                      <ResponsiveLineStackLayout
                        justifyContent="flex-end"
                        noColumnMargin
                      >
                        <FlatButton
                          label={<Trans>Access feedback</Trans>}
                          onClick={() => {}}
                          disabled={!game.publicWebBuildId}
                        />
                        <RaisedButton
                          label={<Trans>Open in browser</Trans>}
                          onClick={openGameUrl}
                          primary
                          disabled={!game.publicWebBuildId}
                        />
                        <IconButton
                          size="small"
                          disabled={!game.publicWebBuildId}
                          onClick={() => setShowShareDialog(true)}
                          tooltip={t`Share`}
                        >
                          <ShareIcon />
                        </IconButton>
                      </ResponsiveLineStackLayout>
                    </Column>
                  </ResponsiveLineStackLayout>
                  <ResponsiveLineStackLayout
                    noMargin
                    justifyContent="flex-start"
                  >
                    <Column expand alignItems="flex-start" noMargin>
                      <Toggle
                        labelPosition="left"
                        onToggle={onToggleDiscoverable}
                        toggled={getCurrentState(
                          game.discoverable,
                          isDiscoverable
                        )}
                        label={<Trans>Make discoverable on Liluo</Trans>}
                        style={{ marginLeft: 0 }}
                      />
                      <Toggle
                        labelPosition="left"
                        onToggle={onToggleAcceptsGameComments}
                        toggled={getCurrentState(
                          game.acceptsGameComments,
                          acceptsGameComments
                        )}
                        label={<Trans>Open for feedback on Liluo</Trans>}
                        style={{ marginLeft: 0 }}
                      />
                    </Column>
                    <Column expand alignItems="flex-start" noMargin>
                      <Toggle
                        labelPosition="left"
                        onToggle={onToggleAcceptsBuildComments}
                        toggled={getCurrentState(
                          game.acceptsBuildComments,
                          acceptsBuildComments
                        )}
                        label={<Trans>Open feedback on all Builds</Trans>}
                        style={{ marginLeft: 0 }}
                      />
                    </Column>
                  </ResponsiveLineStackLayout>
                </Column>
              </ResponsiveLineStackLayout>
            </CardContent>
          </Card>
          {showShareDialog && (
            <ShareDialog
              game={game}
              onClose={() => setShowShareDialog(false)}
            />
          )}
        </>
      )}
    </I18n>
  );
};

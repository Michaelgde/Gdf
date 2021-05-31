// @flow
import type { Node } from 'React';
import { Trans } from '@lingui/macro';

import React, { Component } from 'react';
import FlatButton from '../UI/FlatButton';
import { Tabs, Tab } from '../UI/Tabs';
import Dialog from '../UI/Dialog';
import { Column, Line } from '../UI/Grid';
import CreateProfile from './CreateProfile';
import ProfileDetails from './ProfileDetails';
import EmptyMessage from '../UI/EmptyMessage';
import HelpButton from '../UI/HelpButton';
import UsagesDetails from './UsagesDetails';
import SubscriptionDetails from './SubscriptionDetails';
import UserProfileContext, { type UserProfile } from './UserProfileContext';
import { GamesList } from '../GameDashboard/GamesList';
import { ColumnStackLayout } from '../UI/Layout';

type Props = {|
  currentProject: ?gdProject,
  open: boolean,
  onClose: Function,
  onChangeSubscription: Function,
  initialTab: 'profile' | 'games-dashboard',
|};

type State = {|
  currentTab: string,
|};

export default class ProfileDialog extends Component<Props, State> {
  state: State = {
    currentTab: this.props.initialTab,
  };

  _onChangeTab: (newTab: string) => void = (newTab: string) =>
    this.setState({
      currentTab: newTab,
    });

  render(): Node {
    const { open, onClose } = this.props;
    const actions = [
      <FlatButton
        label={<Trans>Close</Trans>}
        key="close"
        primary={false}
        onClick={onClose}
      />,
    ];

    return (
      <UserProfileContext.Consumer>
        {(userProfile: UserProfile) => (
          <Dialog
            actions={actions}
            secondaryActions={[
              <HelpButton
                key="help"
                helpPagePath={
                  this.state.currentTab === 'games-dashboard'
                    ? '/interface/games-dashboard'
                    : '/interface/profile'
                }
              />,
              userProfile.authenticated && (
                <FlatButton
                  label={<Trans>Refresh</Trans>}
                  key="refresh"
                  onClick={userProfile.onRefreshUserProfile}
                />
              ),
              userProfile.authenticated && userProfile.profile && (
                <FlatButton
                  label={<Trans>Logout</Trans>}
                  key="logout"
                  onClick={userProfile.onLogout}
                />
              ),
            ]}
            onRequestClose={onClose}
            cannotBeDismissed={false}
            open={open}
            noMargin
          >
            <Tabs value={this.state.currentTab} onChange={this._onChangeTab}>
              <Tab label={<Trans>My Profile</Trans>} value="profile" />
              <Tab
                label={<Trans>Games Dashboard</Trans>}
                value="games-dashboard"
              />
              <Tab label={<Trans>Services Usage</Trans>} value="usage" />
            </Tabs>
            {this.state.currentTab === 'profile' &&
              (userProfile.authenticated ? (
                <Column noMargin>
                  <ProfileDetails profile={userProfile.profile} />
                  <SubscriptionDetails
                    subscription={userProfile.subscription}
                    onChangeSubscription={this.props.onChangeSubscription}
                  />
                </Column>
              ) : (
                <Column>
                  <CreateProfile
                    onLogin={userProfile.onLogin}
                    onCreateAccount={userProfile.onCreateAccount}
                  />
                </Column>
              ))}
            {this.state.currentTab === 'games-dashboard' &&
              (userProfile.authenticated ? (
                <Line>
                  <ColumnStackLayout expand>
                    <GamesList project={this.props.currentProject} />
                  </ColumnStackLayout>
                </Line>
              ) : (
                <Column>
                  <CreateProfile
                    onLogin={userProfile.onLogin}
                    onCreateAccount={userProfile.onCreateAccount}
                    message={
                      <Trans>
                        Create an account to register your games and to get
                        access to metrics collected anonymously, like the number
                        of daily players and retention of the players after a
                        few days.
                      </Trans>
                    }
                  />
                </Column>
              ))}
            {this.state.currentTab === 'usage' &&
              (userProfile.authenticated ? (
                <Column noMargin>
                  <UsagesDetails usages={userProfile.usages} />
                </Column>
              ) : (
                <EmptyMessage>
                  <Trans>
                    Register to see the usage that you've made of the online
                    services
                  </Trans>
                </EmptyMessage>
              ))}
          </Dialog>
        )}
      </UserProfileContext.Consumer>
    );
  }
}

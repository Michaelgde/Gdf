// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';

import List from '@material-ui/core/List';
import { Line, Column } from '../../../../UI/Grid';

import {
  type FileMetadataAndStorageProviderName,
  type StorageProvider,
} from '../../../../ProjectsStorage';
import SectionContainer, { SectionRow } from '../SectionContainer';
import CircularProgress from '../../../../UI/CircularProgress';
import useForceUpdate from '../../../../Utils/UseForceUpdate';
import {
  type TeamGroup,
  type TeamMembership,
  type User,
} from '../../../../Utils/GDevelopServices/User';
import { type CloudProjectWithUserAccessInfo } from '../../../../Utils/GDevelopServices/Project';
import TeamContext from '../../../../Profile/Team/TeamContext';
import TeamGroupNameField from './TeamGroupNameField';
import NewTeamGroupNameField from './NewTeamGroupNameField';
import TeamMemberRow from './TeamMemberRow';
import { makeDropTarget } from '../../../../UI/DragAndDrop/DropTarget';
import GDevelopThemeContext from '../../../../UI/Theme/GDevelopThemeContext';
import EmptyMessage from '../../../../UI/EmptyMessage';
import Text from '../../../../UI/Text';
import FlatButton from '../../../../UI/FlatButton';
import Add from '../../../../UI/CustomSvgIcons/Add';
import TeamMemberProjectsView from './TeamMemberProjectsView';
import Refresh from '../../../../UI/CustomSvgIcons/Refresh';
import { ColumnStackLayout, LineStackLayout } from '../../../../UI/Layout';
import Paper from '../../../../UI/Paper';
import { useResponsiveWindowWidth } from '../../../../UI/Reponsive/ResponsiveWindowMeasurer';

const PADDING = 16;

const styles = {
  list: { padding: 0 },
  lobbyContainer: { padding: PADDING },
  roomsContainer: { paddingRight: PADDING },
};

const sortMembersByNameOrEmail = (a: User, b: User) => {
  return (a.username || a.email).localeCompare(b.username || b.email);
};

const DropTarget = makeDropTarget('team-groups');

type GroupWithMembers = {| group: TeamGroup, members: User[] |};

type Props = {|
  project: ?gdProject,
  onOpenRecentFile: (file: FileMetadataAndStorageProviderName) => void,
  storageProviders: Array<StorageProvider>,
|};

export type TeamSectionInterface = {|
  forceUpdate: () => void,
|};

export const groupMembersByGroupId = ({
  groups,
  members,
  memberships,
}: {|
  groups: ?(TeamGroup[]),
  members: ?(User[]),
  memberships: ?(TeamMembership[]),
|}): ?{ [groupId: string]: GroupWithMembers } => {
  if (!(groups && members && memberships)) return null;
  const membersByGroupId = {};
  members.forEach(member => {
    const membership = memberships.find(
      membership => membership.userId === member.id
    );
    if (!membership) return;
    const memberGroups = membership.groups;
    if (!memberGroups) {
      const itemWithoutGroup = membersByGroupId['NONE'];
      membersByGroupId['NONE'] = {
        members: [
          ...((itemWithoutGroup && itemWithoutGroup.members) || []),
          member,
        ],
        group: { id: 'none', name: 'none' },
      };
      return;
    }
    const group = groups.find(group => group.id === memberGroups[0]);
    if (!group) return;
    const item = membersByGroupId[group.id];
    if (item) {
      item.members = [...item.members, member];
    } else {
      membersByGroupId[group.id] = { group, members: [member] };
    }
  });
  groups.forEach(group => {
    if (!(group.id in membersByGroupId)) {
      membersByGroupId[group.id] = { group, members: [] };
    }
  });
  return membersByGroupId;
};

const TeamSection = React.forwardRef<Props, TeamSectionInterface>(
  ({ project, onOpenRecentFile, storageProviders }, ref) => {
    const {
      groups,
      members,
      memberships,
      onChangeGroupName,
      onChangeUserGroup,
      onListUserProjects,
      onDeleteGroup,
      onCreateGroup,
      onRefreshMembers,
    } = React.useContext(TeamContext);
    const gdevelopTheme = React.useContext(GDevelopThemeContext);
    const forceUpdate = useForceUpdate();
    const windowWidth = useResponsiveWindowWidth();
    const isMobile = windowWidth === 'small';

    React.useImperativeHandle(ref, () => ({
      forceUpdate,
    }));

    const draggedUserRef = React.useRef<?User>(null);
    const [selectedUser, setSelectedUser] = React.useState<?User>(null);
    const [
      selectedUserProjects,
      setSelectedUserProjects,
    ] = React.useState<?Array<CloudProjectWithUserAccessInfo>>(null);
    const [
      isLoadingUserProjects,
      setIsLoadingUserProjects,
    ] = React.useState<boolean>(false);
    const [
      showNewGroupNameField,
      setShowNewGroupNameField,
    ] = React.useState<boolean>(false);
    const [isLoadingMembers, setIsLoadingMembers] = React.useState<boolean>(
      false
    );

    const setDraggedUser = React.useCallback((user: User) => {
      draggedUserRef.current = user;
    }, []);

    const listUserProjects = React.useCallback(
      async (user: User) => {
        setIsLoadingUserProjects(true);
        try {
          setSelectedUser(user);
          const userProjects = await onListUserProjects(user);
          setSelectedUserProjects(userProjects);
        } catch (error) {
          console.error(error);
        } finally {
          setIsLoadingUserProjects(false);
        }
      },
      [onListUserProjects]
    );

    const onRefreshTeamMembers = React.useCallback(
      async () => {
        setIsLoadingMembers(true);
        try {
          await onRefreshMembers();
        } catch (error) {
          console.error(
            'An error occurred when refreshing team members:',
            error
          );
        } finally {
          setIsLoadingMembers(false);
        }
      },
      [onRefreshMembers]
    );

    const membersByGroupId = groupMembersByGroupId({
      groups,
      members,
      memberships,
    });
    if (!membersByGroupId) {
      return (
        <>
          <SectionContainer title={<Trans>Team</Trans>}>
            <SectionRow>
              <Line>
                <Column noMargin expand alignItems="center">
                  <CircularProgress />
                </Column>
              </Line>
            </SectionRow>
          </SectionContainer>
        </>
      );
    }

    if (selectedUser) {
      return (
        <TeamMemberProjectsView
          user={selectedUser}
          projects={selectedUserProjects}
          storageProviders={storageProviders}
          onOpenRecentFile={onOpenRecentFile}
          onClickBack={() => {
            setSelectedUser(null);
            setSelectedUserProjects(null);
          }}
          onRefreshProjects={listUserProjects}
          isLoadingProjects={isLoadingUserProjects}
        />
      );
    }

    const membersNotInAGroup = membersByGroupId['NONE'];
    const groupsAndMembers = Object.keys(membersByGroupId)
      .map(id => (id === 'NONE' ? null : membersByGroupId[id]))
      .filter(Boolean)
      .sort((a, b) => a.group.name.localeCompare(b.group.name));

    return (
      <SectionContainer
        title={<Trans>Classrooms</Trans>}
        titleAdornment={
          <FlatButton
            primary
            disabled={isLoadingMembers}
            label={
              isMobile ? (
                <Trans>Refresh</Trans>
              ) : (
                <Trans>Refresh dashboard</Trans>
              )
            }
            onClick={onRefreshTeamMembers}
            leftIcon={<Refresh fontSize="small" />}
          />
        }
      >
        <SectionRow>
          {membersNotInAGroup && (
            <Paper background="medium" style={styles.lobbyContainer}>
              <Line noMargin>
                <ColumnStackLayout noMargin expand>
                  <LineStackLayout noMargin alignItems="center">
                    <Text size="section-title" noMargin>
                      <Trans>Lobby</Trans>
                    </Text>
                  </LineStackLayout>
                  <List style={styles.list}>
                    {membersNotInAGroup.members
                      .sort(sortMembersByNameOrEmail)
                      .map(member => (
                        <TeamMemberRow
                          key={member.id}
                          member={member}
                          onListUserProjects={() => listUserProjects(member)}
                          onDrag={setDraggedUser}
                        />
                      ))}
                  </List>
                </ColumnStackLayout>
              </Line>
            </Paper>
          )}
          <div style={styles.roomsContainer}>
            <Line justifyContent="space-between" alignItems="center">
              <LineStackLayout noMargin alignItems="center">
                <Text size="section-title" noMargin>
                  <Trans>Rooms</Trans>
                </Text>
              </LineStackLayout>
              <FlatButton
                primary
                label={
                  isMobile ? (
                    <Trans>Create</Trans>
                  ) : (
                    <Trans>Create a new room</Trans>
                  )
                }
                leftIcon={<Add fontSize="small" />}
                onClick={() => setShowNewGroupNameField(true)}
              />
            </Line>
            {showNewGroupNameField && (
              <Line>
                <NewTeamGroupNameField
                  onValidateGroupName={onCreateGroup}
                  onDismiss={() => setShowNewGroupNameField(false)}
                />
              </Line>
            )}
            {groupsAndMembers.length > 0 ? (
              groupsAndMembers.map(({ group, members }) => (
                <DropTarget
                  canDrop={() => true}
                  drop={() => {
                    if (!draggedUserRef.current) return;
                    onChangeUserGroup(draggedUserRef.current, group);
                    draggedUserRef.current = null;
                  }}
                  key={group.id}
                >
                  {({ connectDropTarget, isOver }) =>
                    connectDropTarget(
                      <div
                        style={
                          isOver
                            ? {
                                backgroundColor:
                                  gdevelopTheme.paper.backgroundColor.light,
                                outline: `2px dashed ${
                                  gdevelopTheme.dropIndicator.canDrop
                                }`,
                              }
                            : undefined
                        }
                      >
                        <Line noMargin>
                          <Column noMargin expand>
                            <Column noMargin>
                              <TeamGroupNameField
                                group={group}
                                onFinishEditingGroupName={onChangeGroupName}
                                allowDelete={members.length === 0}
                                onDeleteGroup={onDeleteGroup}
                              />
                            </Column>
                            <List style={styles.list}>
                              {members
                                .sort(sortMembersByNameOrEmail)
                                .map(member => (
                                  <TeamMemberRow
                                    key={member.id}
                                    member={member}
                                    onListUserProjects={() =>
                                      listUserProjects(member)
                                    }
                                    onDrag={setDraggedUser}
                                  />
                                ))}
                            </List>
                          </Column>
                        </Line>
                      </div>
                    )
                  }
                </DropTarget>
              ))
            ) : !showNewGroupNameField ? (
              <EmptyMessage>
                <Trans>Create a room and drag and drop members in it.</Trans>
              </EmptyMessage>
            ) : null}
          </div>
        </SectionRow>
      </SectionContainer>
    );
  }
);

export default TeamSection;
// @flow
import React from 'react';
import { Trans } from '@lingui/macro';
import SemiControlledTextField from '../UI/SemiControlledTextField';
import { UsersAutocomplete } from '../Utils/UsersAutocomplete';
import { ColumnStackLayout } from '../UI/Layout';
import Checkbox from '../UI/Checkbox';
import SelectField from '../UI/SelectField';
import SelectOption from '../UI/SelectOption';
import { t } from '@lingui/macro';
import SemiControlledMultiAutoComplete from '../UI/SemiControlledMultiAutoComplete';
import {
  allGameCategories,
  getCategoryName,
} from '../Utils/GDevelopServices/Game';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import { Line, Spacer } from '../UI/Grid';
import { I18n } from '@lingui/react';
import { string } from 'prop-types';

const getSlugFromName = (name: string) => {
  return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
}

type Props = {|
  project: gdProject,
  userName: string,
  setName: string => void,
  name: string,
  setCategories?: (string[]) => void,
  categories?: string[],
  setDescription: string => void,
  description: ?string,
  setAuthorIds: (string[]) => void,
  authorIds: string[],
  setOwnerIds?: (string[]) => void,
  ownerIds?: string[],
  setPlayableWithKeyboard?: boolean => void,
  playWithKeyboard?: boolean,
  setPlayableWithGamepad?: boolean => void,
  playWithGamepad?: boolean,
  setPlayableWithMobile?: boolean => void,
  playWithMobile?: boolean,
  setOrientation: string => void,
  orientation: string,
  userSlug?: string,
  setUserSlug: string => void,
  gameSlug?: string,
  setGameSlug: string => void,
|};

function PublicGameProperties({
  project,
  setName,
  name,
  categories,
  setCategories,
  setDescription,
  description,
  setAuthorIds,
  authorIds,
  setOwnerIds,
  ownerIds,
  setPlayableWithKeyboard,
  playWithKeyboard,
  setPlayableWithGamepad,
  playWithGamepad,
  setPlayableWithMobile,
  playWithMobile,
  setOrientation,
  orientation,
  userSlug,
  setUserSlug,
  gameSlug,
  setGameSlug,
}: Props) {
  const [categoryInput, setCategoryInput] = React.useState('');
  const { profile } = React.useContext(
    AuthenticatedUserContext
  );

  return (
    <I18n>
      {({ i18n }) => (
        <ColumnStackLayout noMargin>
          <SemiControlledTextField
            floatingLabelText={<Trans>Game name</Trans>}
            fullWidth
            type="text"
            value={name}
            onChange={setName}
            autoFocus
          />
          {setCategories && (
            <SemiControlledMultiAutoComplete
              hintText={t`Select a genre`}
              floatingLabelText={<Trans>Genres</Trans>}
              helperText={
                <Trans>
                  Select up to 4 genres, the first one will define the game's
                  main genre
                </Trans>
              }
              value={
                categories
                  ? categories.map(category => ({
                      value: category,
                      text: getCategoryName(category, i18n),
                    }))
                  : []
              }
              onChange={(event, values) => {
                setCategories(
                  values ? values.map(category => category.value) : []
                );
              }}
              inputValue={categoryInput}
              onInputChange={(event, value) => {
                setCategoryInput(value);
              }}
              dataSource={allGameCategories.map(category => ({
                value: category,
                text: getCategoryName(category, i18n),
              }))}
              fullWidth
              optionsLimit={4}
            />
          )}
          <SemiControlledTextField
            floatingLabelText={<Trans>Game description</Trans>}
            fullWidth
            type="text"
            value={description || ''}
            onChange={setDescription}
            autoFocus
            multiline
            rows={5}
          />
          {// This view is used for public game properties as well as project properties.
          // This property is not shown in project properties.
          setUserSlug && setGameSlug && (
            <Line>
            <SelectField
              fullWidth
              floatingLabelText={<Trans>User name in the game URL</Trans>}
              value={userSlug || profile.username}
              onChange={(e, i, value: string) => setUserSlug(value)}
            >
              <SelectOption value={profile.username} primaryText={profile.username} />
              {userSlug && userSlug !== profile.username && <SelectOption value={userSlug} primaryText={userSlug} />}
            </SelectField>
            <Spacer/>
            <SemiControlledTextField
              floatingLabelText={<Trans>Game name in the game URL</Trans>}
              fullWidth
              type="text"
              value={gameSlug || getSlugFromName(name)}
              onChange={setGameSlug}
              autoFocus
            />
            </Line>
          )
          }
          <UsersAutocomplete
            userIds={authorIds}
            onChange={setAuthorIds}
            floatingLabelText={<Trans>Authors</Trans>}
            helperText={
              <Trans>
                Select the usernames of the authors of this project. They will
                be displayed in the selected order, if you publish this game as
                an example or in the community.
              </Trans>
            }
          />
          {// This view is used for public game properties as well as project properties.
          // This property is not shown in project properties.
          setOwnerIds && (
            <UsersAutocomplete
              userIds={ownerIds || []}
              onChange={setOwnerIds}
              floatingLabelText={<Trans>Owners</Trans>}
              helperText={
                <Trans>
                  Select the usernames of the owners of this project to let them
                  manage this game builds. Be aware that owners can revoke your
                  ownership.
                </Trans>
              }
            />
          )}
          <SelectField
            fullWidth
            floatingLabelText={<Trans>Device orientation (for mobile)</Trans>}
            value={orientation}
            onChange={(e, i, value: string) => setOrientation(value)}
          >
            <SelectOption value="default" primaryText={t`Platform default`} />
            <SelectOption value="landscape" primaryText={t`Landscape`} />
            <SelectOption value="portrait" primaryText={t`Portrait`} />
          </SelectField>
          {// This view is used for public game properties as well as project properties.
          // The following properties are not shown in project properties.
          setPlayableWithKeyboard &&
            setPlayableWithGamepad &&
            setPlayableWithMobile && (
              <React.Fragment>
                <Checkbox
                  label={<Trans>Playable with a keyboard</Trans>}
                  checked={!!playWithKeyboard}
                  onCheck={(e, checked) => setPlayableWithKeyboard(checked)}
                />
                <Checkbox
                  label={<Trans>Playable with a gamepad</Trans>}
                  checked={!!playWithGamepad}
                  onCheck={(e, checked) => setPlayableWithGamepad(checked)}
                />
                <Checkbox
                  label={<Trans>Playable on mobile</Trans>}
                  checked={!!playWithMobile}
                  onCheck={(e, checked) => setPlayableWithMobile(checked)}
                />
              </React.Fragment>
            )}
        </ColumnStackLayout>
      )}
    </I18n>
  );
}

export default PublicGameProperties;

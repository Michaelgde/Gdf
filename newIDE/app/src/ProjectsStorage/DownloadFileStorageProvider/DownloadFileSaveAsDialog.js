// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import Dialog from '../../UI/Dialog';
import FlatButton from '../../UI/FlatButton';
import RaisedButton from '../../UI/RaisedButton';
import { Line } from '../../UI/Grid';
import { ColumnStackLayout } from '../../UI/Layout';
import Window from '../../Utils/Window';
import {
  BlobDownloadUrlHolder,
  openBlobDownloadUrl,
} from '../../Utils/BlobDownloadUrlHolder';
import PlaceholderLoader from '../../UI/PlaceholderLoader';
import { serializeToJSObject } from '../../Utils/Serializer';
import { showErrorBox } from '../../UI/Messages/MessageBox';
import Text from '../../UI/Text';
import {
  downloadUrlsToBlobs,
  type ItemResult,
} from '../../Utils/BlobDownloader';
import { useGenericRetryableProcessWithProgress } from '../../Utils/UseGenericRetryableProcessWithProgress';
import { checkIfIsGDevelopCloudBucketUrl } from '../../Utils/CrossOrigin';
import { extractFilenameFromProjectResourceUrl } from '../../Utils/GDevelopServices/Project';
import {
  archiveFiles,
  type BlobFileDescriptor,
  type TextFileDescriptor,
} from '../../Utils/BrowserArchiver';
const gd: libGDevelop = global.gd;

const isURL = (filename: string) => {
  return (
    filename.startsWith('http://') ||
    filename.startsWith('https://') ||
    filename.startsWith('ftp://') ||
    filename.startsWith('blob:') ||
    filename.startsWith('data:')
  );
};

type DownloadResourcesAsBlobsOptionsWithoutProgress = {
  project: gdProject,
  onAddBlobFile: (blobFileDescriptor: BlobFileDescriptor) => void,
};

type DownloadResourcesAsBlobsOptions = {
  ...DownloadResourcesAsBlobsOptionsWithoutProgress,
  onProgress: (count: number, total: number) => void,
};

export const downloadResourcesAsBlobs = async ({
  project,
  onAddBlobFile,
  onProgress,
}: DownloadResourcesAsBlobsOptions) => {
  const result = {
    erroredResources: [],
  };

  type ResourceToFetch = {|
    resource: gdResource,
    url: string,
    filename: string,
  |};

  const getResourcesToFetch = (project: gdProject): Array<ResourceToFetch> => {
    const resourcesManager = project.getResourcesManager();
    const allResourceNames = resourcesManager.getAllResourceNames().toJSArray();
    return allResourceNames
      .map(
        (resourceName: string): ?ResourceToFetch => {
          const resource = resourcesManager.getResource(resourceName);
          const resourceFile = resource.getFile();

          if (isURL(resourceFile)) {
            if (checkIfIsGDevelopCloudBucketUrl(resourceFile)) {
              return {
                resource,
                url: resourceFile,
                filename: extractFilenameFromProjectResourceUrl(resourceFile),
              };
            } else {
              // Public URL resource: nothing to do.
              return null;
            }
          } else {
            // Local resource: unsupported.
            result.erroredResources.push({
              resourceName: resource.getName(),
              error: new Error(
                'Unsupported relative file when downloading a copy.'
              ),
            });
            return null;
          }
        }
      )
      .filter(Boolean);
  };

  const resourcesToFetchAndUpload = getResourcesToFetch(project);

  // Download all the project resources as blob (much like what is done during an export).
  const downloadedBlobsAndResources: Array<
    ItemResult<ResourceToFetch>
  > = await downloadUrlsToBlobs({
    urlContainers: resourcesToFetchAndUpload,
    onProgress: (count, total) => {
      onProgress(count, total * 2);
    },
  });

  downloadedBlobsAndResources.forEach(({ item, error, blob }) => {
    const { resource, filename } = item;
    // TODO: handle conflicts of filenames (and do a test file for this).
    // TODO: organise by resource type in a "assets folder".
    if (error || !blob) {
      result.erroredResources.push({
        resourceName: resource.getName(),
        error: error || new Error('Unknown error during download.'),
      });
      return;
    }

    resource.setFile(filename);
    onAddBlobFile({ blob, filePath: filename });
  });

  return result;
};

type Props = {|
  project: gdProject,
  onDone: () => void,
|};

export default function DownloadFileSaveAsDialog({ project, onDone }: Props) {
  const [zippedProjectBlob, setZippedProjectBlob] = React.useState<?Blob>(null);
  const {
    ensureProcessIsDone,
    renderProcessDialog,
  } = useGenericRetryableProcessWithProgress<DownloadResourcesAsBlobsOptionsWithoutProgress>(
    {
      onDoProcess: React.useCallback(
        (options, onProgress) =>
          downloadResourcesAsBlobs({ ...options, onProgress }),
        []
      ),
    }
  );
  React.useEffect(
    () => {
      (async () => {
        setZippedProjectBlob(null);
        const newProject = gd.ProjectHelper.createNewGDJSProject();
        try {
          // Make a copy of the project, as it will be updated.
          const serializedProject = new gd.SerializerElement();
          project.serializeTo(serializedProject);
          newProject.unserializeFrom(serializedProject);

          // Download resources to blobs, and update the project resources.
          const blobFiles: Array<BlobFileDescriptor> = [];
          const textFiles: Array<TextFileDescriptor> = [];
          await ensureProcessIsDone({
            project: newProject,
            onAddBlobFile: (blobFileDescriptor: BlobFileDescriptor) => {
              blobFiles.push(blobFileDescriptor);
            },
          });

          // Serialize the project.
          textFiles.push({
            text: JSON.stringify(serializeToJSObject(newProject)),
            filePath: 'game.json',
          });

          // Archive the whole project.
          const zippedProjectBlob = await archiveFiles({
            textFiles,
            blobFiles,
            basePath: '/',
            onProgress: (count: number, total: number) => {},
          });
          setZippedProjectBlob(zippedProjectBlob);
        } catch (rawError) {
          showErrorBox({
            message:
              'Unable to save your project because of an internal error.',
            rawError,
            errorId: 'download-file-save-as-dialog-error',
          });
          return;
        } finally {
          newProject.delete();
        }
      })();
      return () => setZippedProjectBlob(null);
    },
    [project, ensureProcessIsDone]
  );

  return (
    <Dialog
      actions={[
        <FlatButton
          key="download"
          label={<Trans>Download GDevelop desktop version</Trans>}
          primary={false}
          onClick={() => Window.openExternalURL('http://gdevelop.io')}
        />,
        <FlatButton
          key="close"
          label={<Trans>Close</Trans>}
          primary={false}
          onClick={onDone}
        />,
      ]}
      onRequestClose={onDone}
      open
      maxWidth="sm"
      title={<Trans>Download a copy</Trans>}
    >
      <ColumnStackLayout noMargin>
        <Text>
          <Trans>
            You can download the file of your game to continue working on it
            using the full GDevelop version:
          </Trans>
        </Text>
        <Line noMargin expand justifyContent="center">
          {zippedProjectBlob ? (
            <BlobDownloadUrlHolder blob={zippedProjectBlob}>
              {blobDownloadUrl => (
                <RaisedButton
                  primary
                  onClick={() =>
                    openBlobDownloadUrl(blobDownloadUrl, 'gdevelop-game.zip')
                  }
                  label={
                    <Trans>Download the compressed game and resources</Trans>
                  }
                />
              )}
            </BlobDownloadUrlHolder>
          ) : (
            <PlaceholderLoader />
          )}
        </Line>
      </ColumnStackLayout>
      {renderProcessDialog()}
    </Dialog>
  );
}

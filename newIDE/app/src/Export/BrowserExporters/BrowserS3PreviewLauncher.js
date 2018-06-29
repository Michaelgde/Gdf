// @flow
import * as React from 'react';
import BrowserS3FileSystem from './BrowserS3FileSystem';
import BrowserPreviewLinkDialog from './BrowserPreviewLinkDialog';
import { findGDJS } from './BrowserS3GDJSFinder';
import assignIn from 'lodash/assignIn';
import { type PreviewOptions } from '../PreviewLauncher.flow';
import { GDevelopGamesPreview } from '../../Utils/GDevelopServices/ApiConfigs';
import { makeTimestampedId } from '../../Utils/TimestampedId';
const awsS3 = require('aws-sdk/clients/s3');
const gd = global.gd;

const {
  destinationBucket,
  accessKeyId,
  secretAccessKey,
  region,
  destinationBucketBaseUrl,
} = GDevelopGamesPreview;

const awsS3Client = new awsS3({
  accessKeyId: accessKeyId,
  secretAccessKey: secretAccessKey,
  region: region,
  correctClockSkew: true,
});

type State = {|
  showPreviewLinkDialog: boolean,
  url: ?string,
|};

type Props = {};

export default class BrowserS3PreviewLauncher extends React.Component<
  Props,
  State
> {
  canDoNetworkPreview = () => false;

  state = {
    showPreviewLinkDialog: false,
    url: null,
  };

  _openPreviewWindow = (project: gdProject, url: string): any => {
    const windowObjectReference = window.open(url, `_blank`);
    return {
      url,
      windowObjectReference,
    };
  };

  _prepareExporter = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      findGDJS(({ gdjsRoot, filesContent }) => {
        if (!gdjsRoot) {
          console.error('Could not find GDJS');
          return reject();
        }
        console.info('GDJS found in ', gdjsRoot);

        const prefix = makeTimestampedId();

        const outputDir = destinationBucketBaseUrl + prefix;
        const browserS3FileSystem = new BrowserS3FileSystem({
          filesContent,
          awsS3Client,
          bucket: destinationBucket,
          bucketBaseUrl: destinationBucketBaseUrl,
          prefix,
        });
        const fileSystem = assignIn(
          new gd.AbstractFileSystemJS(),
          browserS3FileSystem
        );
        const exporter = new gd.Exporter(fileSystem, gdjsRoot);
        exporter.setCodeOutputDirectory(destinationBucketBaseUrl + prefix);

        resolve({
          exporter,
          outputDir,
          browserS3FileSystem,
        });
      });
    });
  };

  launchLayoutPreview = (
    project: gdProject,
    layout: gdLayout,
    options: PreviewOptions
  ): Promise<any> => {
    if (!project || !layout) return Promise.reject();

    return this._prepareExporter().then(
      ({ exporter, outputDir, browserS3FileSystem }) => {
        exporter.exportLayoutForPixiPreview(project, layout, outputDir);
        exporter.delete();
        return browserS3FileSystem
          .uploadPendingObjects()
          .then(() => {
            const finalUrl = outputDir + '/index.html';
            return this._openPreviewWindow(project, finalUrl);
          })
          .then(({ url, windowObjectReference }) => {
            if (!windowObjectReference) {
              this.setState({
                showPreviewLinkDialog: true,
                url,
              });
            }
          });
      }
    );
  };

  launchExternalLayoutPreview = (
    project: gdProject,
    layout: gdLayout,
    externalLayout: gdExternalLayout,
    options: PreviewOptions
  ): Promise<any> => {
    if (!project || !layout || !externalLayout) return Promise.reject();

    return this._prepareExporter().then(
      ({ exporter, outputDir, browserS3FileSystem }) => {
        exporter.exportExternalLayoutForPixiPreview(
          project,
          layout,
          externalLayout,
          outputDir
        );
        exporter.delete();
        return browserS3FileSystem
          .uploadPendingObjects()
          .then(() => {
            const finalUrl = outputDir + '/index.html';
            return this._openPreviewWindow(project, finalUrl);
          })
          .then(({ url, windowObjectReference }) => {
            if (!windowObjectReference) {
              this.setState({
                showPreviewLinkDialog: true,
                url,
              });
            }
          });
      }
    );
  };

  render() {
    const { showPreviewLinkDialog, url } = this.state;
    if (!showPreviewLinkDialog) return null;

    return <BrowserPreviewLinkDialog url={url} />;
  }
}

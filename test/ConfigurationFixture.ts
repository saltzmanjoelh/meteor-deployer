import Configuration from '../src/Configuration';

const obj = {
    buildPath: '/some/path',
    uploadAction: 'aws s3 cp $ARCHIVE_PATH s3://bucketName'
};
const ConfigurationFixture = new Configuration(obj);

export default ConfigurationFixture;

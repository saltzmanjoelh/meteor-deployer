import { MeteorSettings } from '../MeteorSettings';

const MeteorSettingsFixture = new MeteorSettings();
MeteorSettingsFixture.name = 'Example App';
MeteorSettingsFixture.ROOT_URL = 'app.example.com';
MeteorSettingsFixture.PORT = '3000';
MeteorSettingsFixture.MONGO_URL = 'mongo://db.example.com';

export default MeteorSettingsFixture;

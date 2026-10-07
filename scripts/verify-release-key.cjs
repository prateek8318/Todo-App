const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const androidRoot = path.resolve(__dirname, '../android');
const source = fs.readFileSync(path.join(androidRoot, 'release-signing.properties'), 'utf8');
const properties = Object.fromEntries(source.split(/\r?\n/).filter(line => line && !line.startsWith('#')).map(line => {
  const separator = line.indexOf('=');
  return [line.slice(0, separator), line.slice(separator + 1)];
}));
const keytool = process.env.JAVA_HOME
  ? path.join(process.env.JAVA_HOME, 'bin', process.platform === 'win32' ? 'keytool.exe' : 'keytool')
  : 'keytool';
const result = spawnSync(keytool, [
  '-certreq', '-keystore', path.resolve(androidRoot, properties.storeFile),
  '-alias', properties.keyAlias, '-storepass:env', 'TICKD_RELEASE_STORE_PASSWORD',
  '-keypass:env', 'TICKD_RELEASE_KEY_PASSWORD',
], {
  env: { ...process.env, TICKD_RELEASE_STORE_PASSWORD: properties.storePassword, TICKD_RELEASE_KEY_PASSWORD: properties.keyPassword },
  windowsHide: true,
  stdio: 'pipe',
});
if (result.error || result.status !== 0) {
  throw new Error('Release JKS verification failed. Check the saved key, alias and password.');
}
console.log('Release JKS and saved alias/password verified.');

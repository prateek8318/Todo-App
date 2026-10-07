const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');

const androidRoot = path.resolve(__dirname, '../android');
const keyFile = path.join(androidRoot, 'app/release.jks');
const pendingKey = path.join(androidRoot, 'app/release.pending.jks');
const propertiesFile = path.join(androidRoot, 'release-signing.properties');
const existingProperties = fs.existsSync(propertiesFile) ? fs.readFileSync(propertiesFile, 'utf8') : '';

if (fs.existsSync(keyFile) || fs.existsSync(pendingKey)) {
  throw new Error('A release key already exists. This command will not replace it.');
}
if (/^(?:storePassword|keyPassword|keyAlias)[ \t]*=[ \t]*\S/m.test(existingProperties)) {
  throw new Error('Existing signing details found. This command will not replace them.');
}

const password = crypto.randomBytes(32).toString('base64url');
const alias = 'tickd-release';
const keytool = process.env.JAVA_HOME
  ? path.join(process.env.JAVA_HOME, 'bin', process.platform === 'win32' ? 'keytool.exe' : 'keytool')
  : 'keytool';
const result = spawnSync(keytool, [
  '-genkeypair', '-storetype', 'JKS', '-keystore', pendingKey,
  '-storepass:env', 'TICKD_RELEASE_STORE_PASSWORD',
  '-keypass:env', 'TICKD_RELEASE_KEY_PASSWORD',
  '-alias', alias, '-keyalg', 'RSA', '-keysize', '2048',
  '-validity', '10000', '-dname', 'CN=Tickd', '-noprompt',
], {
  env: { ...process.env, TICKD_RELEASE_STORE_PASSWORD: password, TICKD_RELEASE_KEY_PASSWORD: password },
  windowsHide: true,
  stdio: 'pipe',
});

if (result.error || result.status !== 0) {
  throw new Error('Release key generation failed. Check that JAVA_HOME points to a working JDK.');
}

// Save recovery details before moving the generated key to its final filename.
// The user explicitly requested both files to remain trackable in this repo.
fs.writeFileSync(propertiesFile, [
  '# Release signing backup. Keep these details with this exact JKS.',
  'storeFile=app/release.jks',
  `storePassword=${password}`,
  `keyAlias=${alias}`,
  `keyPassword=${password}`,
  '',
].join('\n'));
fs.renameSync(pendingKey, keyFile);
console.log('Release key created: android/app/release.jks');
console.log('Alias and passwords saved: android/release-signing.properties');

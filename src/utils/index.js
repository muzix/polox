require('dotenv').config();
const crypto = require('crypto');
var debug = require('debug')('polonie');

var google = require('googleapis');
var fs = require('fs');
var OAuth2 = google.auth.OAuth2;
export const oauth2Client = new OAuth2(
  process.env.DRIVE_CLIENT_ID,
  process.env.DRIVE_CLIENT_SECRET,
  process.env.DRIVE_REDIRECT_URL
);
// Retrieve tokens via token exchange explained above or set them:
oauth2Client.setCredentials({
  access_token: process.env.DRIVE_ACCESS_TOKEN,
  refresh_token: process.env.DRIVE_REFRESH_TOKEN,
  expiry_date: parseInt(process.env.DRIVE_TOKEN_EXPIRY_DATE)
  // Optional, provide an expiry_date (milliseconds since the Unix Epoch)
  // expiry_date: (new Date()).getTime() + (1000 * 60 * 60 * 24 * 7)
});
var drive = google.drive({ version: 'v3', auth: oauth2Client });

export const encrypt = (data) => {
  return new Promise((resolve, reject) => {
    const cipher = crypto.createCipher('aes192', process.env.CIPHER_PWD);
    let encrypted = '';
    cipher.on('readable', () => {
      const data = cipher.read();
      if (data)
        encrypted += data.toString('hex');
    });
    cipher.on('end', () => {
      resolve(encrypted);
    });

    cipher.write(data);
    cipher.end();
  });
}

export const decrypt = (data) => {
  return new Promise((resolve, reject) => {
    const decipher = crypto.createDecipher('aes192', process.env.CIPHER_PWD);
    let decrypted = '';
    decipher.on('readable', () => {
      const data = decipher.read();
      if (data)
        decrypted += data.toString('utf8');
    });
    decipher.on('end', () => {
      // debug(decrypted);
      resolve(decrypted);
    });

    decipher.write(data, 'hex');
    decipher.end();
  });
}

export const driveUploadImageFromStream = (imageName, mimeType, folderId, stream) => {
  return new Promise((resolve, reject) => {
    var fileMetadata = {
      'name': imageName,
      parents: [folderId]
    };
    var media = {
      mimeType: mimeType,
      body: stream
    };
    drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id'
    }, (err, file) => {
      if (err) {
        debug('Error %s', err);
        reject(err);
      } else {
        debug('Response %s', file.id);
        resolve(file.id);
      }
    });
  });
}

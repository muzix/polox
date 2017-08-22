require('dotenv').config();
const crypto = require('crypto');

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
      console.log(decrypted);
      resolve(decrypted);
    });

    decipher.write(data, 'hex');
    decipher.end();
  });
}

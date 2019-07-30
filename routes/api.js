var express = require('express');
var router = express.Router();

const AWS = require('aws-sdk');
const fs = require('fs');
const fileType = require('file-type');
const bluebird = require('bluebird');
const multiparty = require('multiparty');
const sharp = require('sharp');

var admin = require('firebase-admin');

// configure the keys for accessing AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

// configure AWS to work with promises
AWS.config.setPromisesDependency(bluebird);

// create S3 instance
const s3 = new AWS.S3();

// abstracts function to upload a file returning a promise
const uploadFileS3 = (buffer, name, type) => {
  const params = {
    ACL: 'public-read',
    Body: buffer,
    Bucket: process.env.S3_BUCKET,
    ContentType: type.mime,
    Key: `${name}.${type.ext}`
  };

  return s3.upload(params).promise();
};

router.get('/', function(req, res) {
    createToken = createCustomToken();
    createToken.then(token => {
      tokenApi = token;
      res.send(tokenApi);
    }).catch(err => { console.error('Cant create token!!'); })
});

router.post('/upload', function(req, res) {
  const form = new multiparty.Form();
  form.parse(req, async (err, fields, files) => {
    if(err) throw new Error(err);
    try {
      const path      = files.file[0].path;
      const buffer    = fs.readFileSync(path);
      const type      = fileType(buffer);
      const timestamp = Date.now().toString();
      const fileName  = `bucketFolder/${timestamp}-lg`;
      const semiTransparentRedPng = await sharp(path)
      .resize(480, 240)
      .png()
      .toBuffer();

      if(fields.editor && fields.editor[0]) {
        const data      = await uploadFileS3(buffer, fileName, type);
        return res.status(200).send(data);
      }

      const dataImgCrop      = await uploadFileS3(semiTransparentRedPng, fileName, type);
      return res.status(200).send(dataImgCrop);

    } catch (err) {
      return res.status(400).send(err);
    }
  });
});

module.exports = router;

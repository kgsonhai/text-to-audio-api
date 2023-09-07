const bucket = "graduation-project-api";
const AWS = require("aws-sdk");

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const uploadAudio = (fileName, bucketName, audioStream) => {
  const params = {
    Key: fileName,
    Bucket: bucketName,
    Body: audioStream,
    ContentType: "audio/mpeg",
    ACL: "public-read",
  };

  return new Promise((resolve, reject) => {
    s3.upload(params, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

module.exports = { uploadAudio };

const bucket = "graduation-project-api";
const AWS = require("aws-sdk");
const dotenv = require("dotenv");

dotenv.config({ path: ".env" });

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: "ap-southeast-2",
});

const uploadAudio = (fileName, audioStream) => {
  const bucketName = "graduation-project-api";
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

async function checkAudioExistence(key) {
  const bucketName = "graduation-project-api";
  try {
    await s3.headObject({ Bucket: bucketName, Key: key }).promise();
    return true;
  } catch (error) {
    if (error.code === "NotFound") {
      return false;
    }
    console.error("Lỗi khi kiểm tra file audio:", error);
    throw error;
  }
}

module.exports = { uploadAudio, checkAudioExistence };

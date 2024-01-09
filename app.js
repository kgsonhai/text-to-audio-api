const express = require("express");
const fetch = require("node-fetch");
const path = require("path");
const cors = require("cors");
const gTTS = require("gtts");
const bodyParser = require("body-parser");

const app = express();

const { uploadAudio, checkAudioExistence } = require("./configS3");

const port = 3001;

app.use(cors());

app.use(express.static(path.join(__dirname, "public")));

// Use Node.js body parsing middleware
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.post("/crawler", (request, response) => {
  try {
    response.send({
      message: "Creating audio",
    });
    uuid = request.body.uuid;
    text = request.body.text;
    createAudioVietnamese(uuid, text);
  } catch (e) {
    console.log({ errror: e });
  }
});

app.post("/convert-audio-vi-to-en", async (request, response) => {
  try {
    uuid = request.body.uuid;
    text = request.body.text;
    const msg = await createAudioEnglish(uuid, text);
    console.log({ msg });
    response.send({ msg });
  } catch (e) {
    console.log({ error: e, uuid });
  }
});

app.post("/check-exist-audio-S3", async (request, response) => {
  try {
    uuid = request.body.uuid;
    const res = await checkAudioExistence(uuid);
    response.send({ uuid, isExisted: res });
  } catch (e) {
    console.log({ error: e, uuid });
  }
});

async function createAudioVietnamese(uuid, text) {
  try {
    const gtts = new gTTS(text, "vi");
    const audioStream = gtts.stream();
    const fileName = `${uuid}.mp3`;
    const result = await uploadAudio(fileName, audioStream);
    console.log({ uuid: result?.key });
    msg = { uuid: uuid, status: "AUDIO_CRAWLING_SUCCESS" };
    sendResult(msg);
  } catch (error) {
    msg = { uuid: uuid, status: "AUDIO_CRAWLING_FAILED" };
    throw new Error(error);
  }
}

async function createAudioEnglish(uuid, text) {
  try {
    const gtts = new gTTS(text, "en");
    const audioStream = await gtts.stream();
    const fileName = `${uuid}_en.mp3`;
    const result = await uploadAudio(fileName, audioStream);
    console.log({ uuid: result?.key });
    msg = { uuid: result?.key, status: "CONVERT-AUDIO-EN-SUCCESS" };
    return msg;
  } catch (error) {
    msg = { uuid: uuid, status: "CONVERT-AUDIO-EN-FAIL" };
    throw new Error(error);
  }
}

async function sendResult(message) {
  await fetch("http://localhost:8080/api/internal/crawler/audio", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  })
    .then((response) => {
      if (response.status != 204) {
        console.log("Request error code " + response.status);
        return;
      }
    })
    .catch((err) => {
      console.log("Error: ", err);
    });
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Start the server
const server = app.listen(port, (error) => {
  if (error) return console.log(`Error: ${error}`);

  console.log(`Server listening on port ${server.address().port}`);
});

const express = require("express");
const fetch = require("node-fetch");
const path = require("path");
const gTTS = require("gtts");
const port = 3001;
const bodyParser = require("body-parser");
const app = express();
const BASE_AUDIO_PATH = "./public/audio/";

const { uploadAudio } = require("./configS3");

app.use(express.static(path.join(__dirname, "public")));

// Use Node.js body parsing middleware
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.get("/", (request, response) => {
  response.send({
    message: "Node.js and Express REST API",
  });
});

app.post("/crawler", (request, response) => {
  try {
    response.send({
      message: "Creating audio",
    });
    uuid = request.body.uuid;
    text = request.body.text;
    createAudio(uuid, text);
  } catch (e) {
    console.log({ errror: e });
  }
});

app.post("/demo/saveS3", (request, response) => {
  try {
    response.send({
      message: "Creating audio",
    });
    uuid = request.body.uuid;
    text = request.body.text;
    createAudio(uuid, text);
  } catch (e) {
    console.log({ errror: e });
  }
});

async function createAudio(uuid, text) {
  var gtts = new gTTS(text, "vi");
  try {
    const gtts = new gTTS(text, "vi");
    const audioStream = await gtts.stream();

    msg = { uuid: uuid, status: "AUDIO_CRAWLING_SUCCESS" };

    const fileName = `${uuid}.mp3`;
    const bucketName = "graduation-project-api";
    await uploadAudio(fileName, bucketName, audioStream);
    sendResult(msg);
  } catch (error) {
    msg = { uuid: uuid, status: "AUDIO_CRAWLING_FAILED" };
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

// Start the server
const server = app.listen(port, (error) => {
  if (error) return console.log(`Error: ${error}`);

  console.log(`Server listening on port ${server.address().port}`);
});

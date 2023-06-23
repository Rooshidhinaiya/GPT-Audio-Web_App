const path = require("path");
const express = require("express");
const colors = require("colors");
const dotenv = require("dotenv");
const socketio = require("socket.io");
const dialogflow = require("@google-cloud/dialogflow");
const uuid = require("uuid");
// const projectId = 'rooshi-dhinaiya-mktv';
const app = express();

dotenv.config({ path: "./config/config.env" });

app.use(express.static(path.join(__dirname, "views")));
app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 3000;

const server = app.listen(
  PORT,
  console.log(
    `Server is runnig on ${process.env.NODE_ENV} mode at port ${PORT}`.yellow
      .bold
  )
);

const io = socketio(server);
io.on("connection", function (socket) {
  console.log("a user connected");

  socket.on("chat message", (message) => {
    console.log(message);

    const callapibot = async (projectId = process.env.PROJECT_ID) => {
      try {
        const sessionId = uuid.v4();
        const sessionClient = new dialogflow.SessionsClient({
          keyFilename: "./rooshi-dhinaiya-mktv-390717-517bbbe89202.json",
        });
        const sessionPath = sessionClient.projectAgentSessionPath(
          projectId,
          sessionId
        );
        const request = {
          session: sessionPath,
          queryInput: {
            text: {
              text: message,
              languageCode: "en-US",
            },
          },
        };
        const responses = await sessionClient.detectIntent(request);

        console.log("Detected intent");
        const result = responses[0].queryResult.fulfillmentText;
        socket.emit("bot reply", result);
        console.log(result);
        if (result.intent) {
          console.log(`  Intent: ${result.intent.displayName}`);
        } else {
          console.log(`  No intent matched.`);
        }
      } catch (error) {
        console.log(error);
      }
    };

    callapibot();
  });
});


// const {Storage} = require('@google-cloud/storage');

// async function authenticateImplicitWithAdc() {
//   // This snippet demonstrates how to list buckets.
//   // NOTE: Replace the client created below with the client required for your application.
//   // Note that the credentials are not specified when constructing the client.
//   // The client library finds your credentials using ADC.
//   const storage = new Storage({
//     projectId,
//   });
//   const [buckets] = await storage.getBuckets();
//   console.log('Buckets:');

//   for (const bucket of buckets) {
//     console.log(`- ${bucket.name}`);
//   }

//   console.log('Listed all storage buckets.');
// }

// authenticateImplicitWithAdc();
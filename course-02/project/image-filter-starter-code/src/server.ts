import express from "express";
import bodyParser from "body-parser";
import { filterImageFromURL, deleteLocalFiles } from "./util/util";
import fs from "fs";
import path from "path";

(async () => {
  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;

  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // @TODO1 IMPLEMENT A RESTFUL ENDPOINT
  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  // IT SHOULD
  //    1
  //    1. validate the image_url query
  //    2. call filterImageFromURL(image_url) to filter the image
  //    3. send the resulting file in the response
  //    4. deletes any files on the server on finish of the response
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]

  /**************************************************************************** */

  app.get("/filteredimage", async (req, res) => {
    try {
      const { image_url } = req.query;
      if (image_url) {
        console.log("Filter image started");
        const newURL = await filterImageFromURL(image_url);
        console.log("Filter image completed and here is the path: ", newURL);
        const directoryPath = newURL.split("/").slice(0, -1).join("/");
        res.sendFile(newURL, async (err) => {
          if (err) {
            console.log(err);
            throw err;
          } else {
            console.log("Sent:", newURL);
            let files = fs
              .readdirSync(directoryPath)
              .map((file) => directoryPath + "/" + file);

            console.log({ files });
            console.log("Delete temp images started");
            await deleteLocalFiles(files);
            console.log("Delete temp images completed");
          }
        });
      } else {
        res.send("Missing image_url query param");
      }
    } catch (error) {
      console.log(error);
      res.send("Failed to process the image");
    }
  });

  // Root Endpoint
  // Displays a simple message to the user
  app.get("/", async (req, res) => {
    res.send("try GET /filteredimage?image_url={{}}");
  });

  // Start the Server
  app.listen(port, () => {
    console.log(`server running http://localhost:${port}`);
    console.log(`press CTRL+C to stop server`);
  });
})();

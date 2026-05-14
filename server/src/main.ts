// Load environment variables from .env file
import "dotenv/config";
import { printDatabaseInfo } from "../database/client";

// Check database connection
// Note: This is optional and can be removed if the database connection
// is not required when starting the application
import "../database/checkConnection";

// Import the Express application from ./app
import app from "./app";

// Get the port from the environment variables
const port = process.env.APP_PORT;

// Start the server and listen on the specified port
app
  .listen(port, () => {
    console.info(`Server express listening on port ${port}`);
    try {
      printDatabaseInfo();
    } catch (e) {
      console.log("DB debug failed");
    }
  })
  .on("error", (err: Error) => {
    console.error("Error:", err.message);
  });

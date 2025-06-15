require("dotenv").config();
require("module-alias/register");

// Register extenders (Make sure filenames and paths are correct and committed)
require("@helpers/extenders/Message");
require("@helpers/extenders/Guild");
require("@helpers/extenders/GuildChannel");

const { checkForUpdates } = require("@helpers/BotUtils");
const { initializeMongoose } = require("@src/database/mongoose");
const { BotClient } = require("@src/structures");
const { validateConfiguration } = require("@helpers/Validator");

validateConfiguration();

// Initialize client
const client = new BotClient();
client.loadCommands("src/commands");
client.loadContexts("src/contexts");
client.loadEvents("src/events");

// Catch unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled rejection:", err);
  client.logger?.error?.("Unhandled exception", err);
});

(async () => {
  // Check for updates
  await checkForUpdates();

  // Start dashboard if enabled
  if (client.config.DASHBOARD?.enabled) {
    client.logger.log("Launching dashboard");

    try {
      const { launch } = require("@root/dashboard/app");
      await launch(client); // Dashboard handles DB connection if enabled
    } catch (ex) {
      client.logger.error("Failed to launch dashboard", ex);
    }
  } else {
    // Otherwise initialize database directly
    await initializeMongoose();
  }

  // Start bot
  await client.login(process.env.BOT_TOKEN);
})();

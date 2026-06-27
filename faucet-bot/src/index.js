const { Client, Collection, GatewayIntentBits, IntentsBitField, EmbedBuilder, ActivityType, Events, MessageFlags } = require("discord.js");
const mysql = require("mysql2");
const process = require("process");
const https = require("https");
const fs = require("fs")
const path = require("path");
const errorHandler = require(__dirname + "/errorHandler");
const pkg = require(__dirname + "/../package.json");
const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});
client.db = mysql.createPool({
  multipleStatements: true,
  supportBigNumbers: true,
  bigNumberStrings: true,
  maxIdle: 2,
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
  connectTimeout: 1500,
  idleTimeout: 30000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_ROOT_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: process.env.MYSQL_PORT
});
const HTTPS_options = {
  key: fs.readFileSync('./src/server.key'),
  cert: fs.readFileSync('./src/server.cer'),
}
client.version = pkg.version;
client.commands = new Collection();
const commandFolders = fs.readdirSync(path.join(__dirname, 'commands'));
for (const folder of commandFolders) {
  const commandsPath = path.join(path.join(__dirname, 'commands'), folder);
  const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));
  if (folder.length != 0) {
    for (const file of commandFiles) {
      const command = require(path.join(commandsPath, file));
      if ('data' in command && 'execute' in command) client.commands.set(path.basename(file, path.extname(file)), command);
      else console.warn(`[WARNING] The command at ${path.join(commandsPath, file)} is missing a required "execute" or "data" property.`);
    }
  } else console.log(`[INFO] The command directory ${folder} is empty, skipping.`);
}
const index = new EmbedBuilder();
function APIMessage(response, message, header, log) {
  writeToLog(`EVENT_${log}: ${message}`);
  if (header) response.writeHead(200, { 'Content-Type': 'text/plain' });
  response.write(message);
  response.end();
}
client.on(Events.InteractionCreate, async (mainInteraction) => {
  if (!mainInteraction.isChatInputCommand()) return;
  if (process.env.DEFER === '1') await mainInteraction.deferReply();
  const command = client.commands.get(mainInteraction.commandName);
  if (!command) {
    index.setTitle("Command in development").setDescription("This command is still work in progress.").setColor(0xff0000).setFooter({ text: mainInteraction.guild.name, iconURL: mainInteraction.guild.iconURL({ dynamic: true, size: 32 }) }).setTimestamp();
    if (process.env.DEFER === '1') return await mainInteraction.editReply({ embeds: [index] }); else return await mainInteraction.reply({ embeds: [index], flags: MessageFlags.Ephemeral });
  }
  if (!mainInteraction.guild) {
    index.setTitle("Invalid Interaction").setDescription("Commands are not allowed in DMs.").setColor(0xff0000);
    if (process.env.DEFER === '1') return await mainInteraction.editReply({ embeds: [index] }); else return await mainInteraction.reply({ embeds: [index], flags: MessageFlags.Ephemeral });
  };
  try {
    client.user.setPresence({ status: 'online' });
    if (process.env.RESTART_FLAG === '0' && process.env.MAINTENANCE_MODE !== 'lockdown') await command.execute(mainInteraction, 0);
    else {
      index.setTitle("Permission Denied").setDescription("Commands are temporarily disabled.").setColor(0xff0000).setFooter({ text: mainInteraction.guild.name, iconURL: mainInteraction.guild.iconURL({ dynamic: true, size: 32 }) }).setTimestamp();
      if (process.env.DEFER === '1') return await mainInteraction.editReply({ embeds: [index] }); else return await mainInteraction.reply({ embeds: [index], flags: MessageFlags.Ephemeral });
    }
    if (mainInteraction.commandName !== 'restart') setTimeout(() => client.user.setPresence({ status: 'idle' }), 5000);
  } catch (error) {
    console.log(error);
    index.setTitle("Error executing command").setDescription(`There was an error executing the command\nLog: \n\`\`\`${error}\n\`\`\``).setColor(0xff0000).setFooter({ text: mainInteraction.guild.name, iconURL: mainInteraction.guild.iconURL({ dynamic: true, size: 32 }) }).setTimestamp();
    if (mainInteraction.replied || mainInteraction.deferred) await mainInteraction.followUp({ embeds: [index], flags: MessageFlags.Ephemeral });
    else await mainInteraction.reply({ embeds: [index], flags: MessageFlags.Ephemeral });
  }
});
console.log("Connecting...");
client.once(Events.ClientReady, async (c) => {
  process.env.RESTART_FLAG = '0';
  console.log("Hashcraft Discord bot is online.");
  client.user.setPresence({
    activities: [{
      name: '/help',
      type: ActivityType.Listening
    }],
    status: 'idle'
  });
});
client.login(process.env.TOKEN);
https.createServer(HTTPS_options, async (req, res) => {
  if (req.method !== 'POST') return errorHandler.eventAPIMessage(res, `Events API v1.2`, 1, "API");
  var body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', async () => {
    try {
      const apiData = JSON.parse(body);
      const eventType = apiData.event;
      const date = new Date();
      if (apiData.key !== process.env.EVENT_KEY) return errorHandler.eventAPIMessage(res, 'API Key authentication failed.', 1, 'ERR');
      if (eventType === 'default') return errorHandler.eventAPIMessage(res, 'Default event triggered', 1, 'DEFAULT');
      if (!apiData.start) return errorHandler.eventAPIMessage(res, 'Event is set to not trigger.', 1, 'ERR');
      const guild = await client.guilds.fetch(process.env.GUILD_ID);
      switch (eventType) {
        case 'reminder':
          client.db.query(`select userid, streak, flags from Faucet where last_used < ? - INTERVAL 86399 SECOND AND reminder < ? - INTERVAL 86399 SECOND AND userid > 100 AND wallet_name is not null LIMIT 1`, [date, date], async function (err, result) {
            if (err) return errorHandler.eventAPIMessage(res, `An error occurred while getting data from DB:\n${err}`, 1, eventType);
            console.log(result);
            if (result.length === 0) return errorHandler.eventAPIMessage(res, 'No Users to notify.', 1, eventType);
            index.setTitle("Reminder to claim!").setColor(0x00ff00).setDescription(`You might lose your streak of \`${result[0].streak}\` 🔥!\nHead on over to <#${process.env.BOT_CHANNEL}> to claim your daily drop.`).setFooter({ text: `v${client.version}`, iconURL: process.env.ICON }).setTimestamp();
            const uid = result[0].userid;
            client.db.query(`update Faucet set reminder = ? where userid = ?`, [date, uid], (err) => {
              if (err) return console.error("Could not update reminder date for user " + uid);
            });
            if ((result[0].flags & 1) === 1) return errorHandler.eventAPIMessage(res, `User ${uid} has turned off DM Notifications.`, 1, eventType);
            try {
              await guild.members.fetch(uid).then(async (member) => {
                var caught;
                if (!member) return errorHandler.eventAPIMessage(res, `This user has left the server.`, 1, eventType);
                await client.users.send(uid, { embeds: [index] }).catch((err) => { errorHandler.eventAPIMessage(res, `This user does not allow DM's from server members.`, 1, eventType); caught = err });
                if (!caught) errorHandler.eventAPIMessage(res, `Sent claim reminder to user ${member.displayName}, ID: ${uid}, streak ${result[0].streak}`, 1, eventType);
              });
            } catch (e) {
              errorHandler.eventAPIMessage(res, `Member ID ${uid} not found`, 1, 'ERR');
            }
          });
          break;
        default: return errorHandler.eventAPIMessage(res, 'Default event triggered', 1, 'DEFAULT');
      }
    } catch (e) {
      return errorHandler.eventAPIMessage(res, `Error parsing event data`, 1, 'ERR');
    }
  });
}).listen(process.env.EVENT_PORT, () => console.log(`[INFO] Events API listening on port ${process.env.EVENT_PORT}.`));
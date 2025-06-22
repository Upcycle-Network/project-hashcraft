require('dotenv').config();
const { Client, IntentsBitField, EmbedBuilder, ActivityType, MessageFlags } = require("discord.js");
const https = require ("https");
const fs = require ("fs");
const url = require('url');
const process = require("process");
const mysql = require("mysql2");
const dayjs = require('dayjs');
const notifs = require('./commands/notifications');
const lb = require('./commands/leaderboard');
const help = require('./commands/help');
const link = require('./commands/link');
const claim = require('./commands/claim');
const stats = require('./commands/stats');
const deposit = require("./commands/deposit");
const balance = require("./commands/balance");
const slowmode = require("./commands/slowmode");
const purge = require("./commands/purge");
const restart = require('./commands/restart');
const modbal = require('./commands/modbal');
const mdu = require('./commands/pay');
const flist = require('./commands/faucetlist');
const eyebleach = require('./commands/eyebleach');
const waifu = require('./commands/waifu');
const buzzwords = require('./commands/buzzwords');
const comedy = require('./commands/comedy');
const insult = require('./commands/insultme');
const kanye = require('./commands/kanye');
const quote = require('./commands/quote');
const con = mysql.createPool({
  multipleStatements: true,
  supportBigNumbers: true, 
  bigNumberStrings: true,
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
const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});
const index = new EmbedBuilder();
var rbt;
function APIMessage (response, message, header){
  console.log(`EVENT_API: ${message}`);
  if (header) response.writeHead(200, {'Content-Type': 'text/plain'});
  response.write(message);
  response.end();
}
function endpoint (object, length){
  return String (object.url).substring(0,length);
}
client.on("interactionCreate", async (mainInteraction) => {
  if (!mainInteraction.isChatInputCommand()) return;
  client.user.setPresence({ status: 'online' });
  if (mainInteraction.guild === null){
    if (mainInteraction.commandName == "waifu"){
      waifu.moe(mainInteraction);
    } else {
    index.setTitle("Invalid Interaction").setColor(0xff0000).setDescription(`Ew why are you sliding into my DM's\nThese commands are only usable in the ${process.env.BOT_NAME} Server`).setFooter({ text: `${process.env.BOT_NAME} v${process.env.BOT_VERSION}`, iconURL: process.env.ICON }).setTimestamp();
    await mainInteraction.reply({ embeds: [index] });
    }
  } else {
    if (mainInteraction.member.roles.cache.some(role => role.name === process.env.VERIFIED_ROLE)) {
      switch (mainInteraction.commandName) {
        case 'claim':
          claim.drop(mainInteraction, mainInteraction.user.id, con);
          break;
        case 'deposit':
        if (process.env.MAINTAINENCE === 'true'){
            index.setTitle("Command Temporarily Disabled").setColor(0xff0000).setDescription("The Bot is running on a backup server due to maintainence of main server and hence this command is non-functional.\nYou can still use the other commands.\n Sorry for the inconvenience.").setFooter({ text: `${process.env.BOT_NAME} v${process.env.BOT_VERSION}`, iconURL: process.env.ICON }).setTimestamp();
            await mainInteraction.reply({ embeds: [index], flags: MessageFlags.Ephemeral });
          }
          else {
            deposit.transfer(mainInteraction, mainInteraction.user.id, con);
          }
          break;
        case 'pay':
          mdu.pay(mainInteraction, mainInteraction.user.id, con);
          break;  
        case 'leaderboard':
          lb.show(mainInteraction, con);
          break;
          case "help":
          help.send(mainInteraction);
          break;
        case "stats":
          stats.send(mainInteraction, con);
          break;
        case "eyebleach":
          eyebleach.bless(mainInteraction);
          break;
        case "waifu":
          waifu.moe(mainInteraction);
          break;
        case "buzzwords":
          buzzwords.generate(mainInteraction);
          break;
        case "comedy":
          comedy.kardo(mainInteraction);
          break;
        case "kanye":
          kanye.west(mainInteraction);
          break;
        case "insultme":
          insult.me(mainInteraction);
          break;
        case "quote":
          quote.person(mainInteraction);
          break;
        case 'faucetlist':
          flist.send(mainInteraction);
          break;
        case "link":
          link.start(mainInteraction, mainInteraction.user.id, con, client); //yes this is a sword art online reference
          break;
        case 'balance':
          balance.check(mainInteraction, mainInteraction.user.id, con);
          break;
        case 'notifications':
          notifs.toggle(mainInteraction, mainInteraction.user.id, con);
          break; 
        default:
          if (mainInteraction.member.roles.cache.some(role => role.name === process.env.SERVER_OWNER) || mainInteraction.member.roles.cache.some(role => role.name === process.env.MODERATOR)) {
            switch (mainInteraction.commandName) {
              case 'slowmode':
                slowmode.set(mainInteraction);
                break;
              case 'purge':
                purge.execute(mainInteraction);
                break;
              case 'restart':
                const reboot = await restart.execute(mainInteraction);
                if (reboot){
                  rbt = reboot;
                  client.user.setStatus('invisible');
                  setTimeout(async () => { await client.destroy(); process.exit(22) }, 15000);
                }
              break;
              case 'modbal':
                if (mainInteraction.member.roles.cache.some(role => role.name === process.env.SERVER_OWNER)) modbal.modify (mainInteraction, con);
                else {
                index.setTitle("Oh, Hello Moderator").setColor(0xff0000).setDescription("Only the server owner can use this command.").setFooter({ text: `${process.env.BOT_NAME} v${process.env.BOT_VERSION}`, iconURL: process.env.ICON }).setTimestamp();
                await mainInteraction.reply({ embeds: [index], flags: MessageFlags.Ephemeral });}
              break;
              
            }
          } else {
            index.setTitle("Nice try, pleb").setColor(0xff0000).setDescription("You cannot use admin commands when you're not one, duh.").setFooter({ text: `${process.env.BOT_NAME} v${process.env.BOT_VERSION}`, iconURL: process.env.ICON }).setTimestamp();
            await mainInteraction.reply({ embeds: [index], flags: MessageFlags.Ephemeral });
          }
          break;
      }
  } else if (mainInteraction.commandName === 'link'){
      link.start(mainInteraction, mainInteraction.user.id, con, client);
    } else {
      index.setTitle("User not verified").setColor(0xff0000).setDescription(`Whoa there, we don't know whether you're a human or not.\nIf you want to use the faucet, verify yourself in the <#${process.env.VERIFICATION_CHANNEL}> channel.\nIf you want to link your wallet to play on Duinocraft-CE, run /link.`).setFooter({ text: `${process.env.BOT_NAME} v${process.env.BOT_VERSION}`, iconURL: process.env.ICON }).setTimestamp();
      await mainInteraction.reply({ embeds: [index], flags: MessageFlags.Ephemeral });
    }
  }
  if (!rbt){
    setTimeout(() => { client.user.setPresence({ status: 'idle' }); }, 10000);
  }
});
console.log("Connecting...");
client.on("ready", async (c) => {
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
const server = https.createServer(HTTPS_options, (req, res) => {
 if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
    });
    req.on('end', async () => {
      try {
        const postData = JSON.parse(body);
        if (postData.key === process.env.EVENT_KEY){
        switch (postData.type) {
          case "event":
          switch (postData.event){
          case "reminder":
            if (postData.start){
            const time = dayjs();
            const guild = await client.guilds.fetch(process.env.GUILD_ID);
            con.getConnection(async function (err, dm) {
              if (err) {
              APIMessage(res, `An error occurred while getting SQL Connection: ${err}`, 1);
              } else {
                dm.query(`select userid, streak, flags from Faucet where reminder != '${time.format("YYYY-MM-DD")}' && userid > 100 && wallet_name is not null`, async function (err, result) {
                  if (err){
                    APIMessage(res, `An error occurred while getting data from DB: ${err}`, 1);
                  } else if (result.length === 0){
                    APIMessage(res, `No Users to Notify.`, 1);
                  } else {
                      index.setTitle("Reminder to claim!").setColor(0x00ff00).setDescription(`You might lose your streak of \`${result[0].streak}\` 🔥!\nHead on over to <#1267863776925847592> to claim your daily drop.`).setFooter({ text: `v${process.env.BOT_VERSION}`, iconURL: process.env.ICON }).setTimestamp();
                      const uid = result[0].userid;
                      if (notifs.notifFlag(result[0].flags) == true) {
                      APIMessage(res, `User ${result[0].userid} has turned off Notifications.`, 1);
                      } else {
                        try {
                        await guild.members.fetch(uid)
                        .then((member) => {
                          if (member == false){
                            APIMessage(res, `${uid}: This user has left the server.`, 1);
                            } else {
                            APIMessage(res, `Sent claim reminder to user ${uid}, streak ${result[0].streak}`, 1);
                            client.users.send(uid, { embeds: [index] }).catch((err)=>{
                            APIMessage(res, `This user does not allow DM's from server members.`, 0);
                            });
                          }
                        }).catch ((err) => {
                          APIMessage(res, `${uid}: This user has left the server.`, 1);
                        });
                    } catch (e){
                      APIMessage(res, `${uid}: This user has left the server.`, 1);
                      }
                    }
                    dm.query(`update Faucet set reminder = '${time.format("YYYY-MM-DD")}' where Faucet.userid = ${uid}`, async function (err, result){
                      if (err){
                        APIMessage(res, `Error accessing DB to Update: ${err}`, 1);
                      }
                     });
                   }
                });
              }
            dm.release();
            });
            }
            break;
          default:
            APIMessage(res, `Default Event Triggered`, 1);
        }
            break;
          default:
            APIMessage(res, `No EventType`, 1);
        }
          } else {
          APIMessage(res, `Incorrect Events API Key`, 1);
        }
      } catch (error) {
        APIMessage(res, `Error Parsing Event API data.`, 1);
      }
    });
  } else if (endpoint(req, 6) == "/oauth") {
    const params = url.parse(req.url, true);
    const queryParams = params.query;
    APIMessage(res, `Detected Parameter: ${queryParams.code}`, 1);
  } else {
    APIMessage(res, `Events API v1.1`, 1);
  }
});
server.listen(process.env.EVENT_PORT, () => {
  console.log(`Hashcraft Events API listening on port ${process.env.EVENT_PORT}.`);
});
require('dotenv').config({ path: require('find-config')('.env') });
const { Client, IntentsBitField, EmbedBuilder, ActivityType } = require("discord.js");
const process = require("process");
const mysql = require("mysql2");
const dayjs = require('dayjs');
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
        case 'claim':
          claim.drop(mainInteraction, mainInteraction.user.id, con);
          break;
        case 'deposit':
          if (process.env.MAINTAINENCE){
            index.setTitle("Command Temporarily Disabled").setColor(0xff0000).setDescription("The Bot is running on a backup server due to maintainence of main server and hence this command is non-functional.\nYou can still use the other commands.\n Sorry for the inconvenience.").setFooter({ text: `${process.env.BOT_NAME} v${process.env.BOT_VERSION}`, iconURL: process.env.ICON }).setTimestamp();
            await mainInteraction.reply({ embeds: [index], ephemeral: true });
          }
          else deposit.transfer(mainInteraction, mainInteraction.user.id, con);
          break;
        case 'balance':
          balance.check(mainInteraction, mainInteraction.user.id, con);
          break;
        case 'pay':
          mdu.pay(mainInteraction, mainInteraction.user.id, con);
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
                await mainInteraction.reply({ embeds: [index], ephemeral: true });}
              break;
            }
          } else {
            index.setTitle("Nice try, pleb").setColor(0xff0000).setDescription("You cannot use admin commands when you're not one, duh.").setFooter({ text: `${process.env.BOT_NAME} v${process.env.BOT_VERSION}`, iconURL: process.env.ICON }).setTimestamp();
            await mainInteraction.reply({ embeds: [index], ephemeral: true });
          }
          
          break;
      }
  } else {
    index.setTitle("User not verified").setColor(0xff0000).setDescription(`Whoa there, we don't know whether you're a human or not.\nVerify yourself in the <#${process.env.VERIFICATION_CHANNEL}> channel`).setFooter({ text: `${process.env.BOT_NAME} v${process.env.BOT_VERSION}`, iconURL: process.env.ICON }).setTimestamp();
    await mainInteraction.reply({ embeds: [index], ephemeral: true });
  }
  }
  if (!rbt){
    setTimeout(() => { client.user.setPresence({ status: 'idle' }); }, 10000);
  }
});
console.log("Connecting...");
client.on("ready", async (c) => {
  console.log("Welcome to HashCraft.");
  client.user.setPresence({
    activities: [{
      name: '/help',
      type: ActivityType.Listening
    }],
    status: 'idle'
  });
});
client.login(process.env.TOKEN);
module.exports = {
  notify: async function(){
    const time = dayjs();
    const guild = await client.guilds.fetch(process.env.GUILD_ID);
    con.getConnection(async function (err, dm) {
      if (err) console.log(err); else {
        dm.query(`select userid, streak from Faucet where last_used != '${time.format("YYYY-MM-DD")}'`, async function (err, result) {
          if (err) console.log(err); else {
            for (i = 0; i <= (result.length - 1); i++){
              index.setTitle("Reminder to claim!").setColor(0x00ff00).setDescription(`You might lose your streak of \`${result[i].streak}\` 🔥!\nHead on over to <#1267863776925847592> to claim your daily drop.`).setFooter({ text: `v${process.env.BOT_VERSION}`, iconURL: process.env.ICON }).setTimestamp();
              const uid = result[i].userid;
              try{
                await guild.members.fetch(uid)
                .then((member) => {
                  if (member == false){
                    console.log ("This user has left the server.");
                  } else {
                    console.log (`Sent claim reminder to user ${uid}, streak ${result[i].streak}`);
                    setTimeout(() => {client.users.send(uid, { embeds: [index] }).catch((err)=>{console.log ("This user does not allow DM's from server members.")});}, 500);
                  }
                }).catch ((err) => {console.log ("This user has left the server.");});
            } catch (e){
              console.log ("This user has left the server.");
            }
          }
        }
        });
      }
      dm.release();
    });
  }
}
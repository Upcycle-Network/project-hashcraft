const {EmbedBuilder} = require("discord.js");
const process = require("process");
const https = require ("https");
const insult = new EmbedBuilder().setTitle("An Insult for You").setColor(0xf18701);
module.exports = {
  me: async function (embed) {
    await embed.deferReply();
    https.get(`https://evilinsult.com/generate_insult.php?lang=en&type=json`, (res) => {
        let data = "";
        res.on("data", (chunk) => {data += chunk;});
        res.on("end", async () => {
        const json = JSON.parse(data);
        insult.setThumbnail("https://media.tenor.com/hwvGzPoZ_vwAAAAM/rage-meme-emoji-deepfry-emoji.gif").setDescription(json.insult).setFooter({ text: `Powered by evilinsult.com`, iconURL: process.env.ICON }).setTimestamp();
        await embed.followUp({embeds: [insult]});
    });
    }).on("error", async (e) => {
        insult.setThumbnail("https://media.tenor.com/b6irvfX4ntIAAAAM/sad-crying.gif").setDescription("Error while fetching API Request: ```\n" + e + "\n```").setColor(0xff0000).setTimestamp();
        await embed.followUp({embeds: [insult]});
      });
  }
}
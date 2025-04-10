const {EmbedBuilder} = require("discord.js");
const process = require("process");
const https = require ("https");
const kanye = new EmbedBuilder().setTitle("Kanye West").setColor(0xf18701);
module.exports = {
  west: async function (embed) {
    await embed.deferReply();
    https.get('https://api.kanye.rest', (res) => {
        let data = "";
        res.on("data", (chunk) => {data += chunk;});
        res.on("end", async () => {
        const json = JSON.parse(data);
        kanye.setThumbnail("https://media.tenor.com/K-KTshhwK4gAAAAM/kanye-kanye-weat.gif").setDescription(`"${json.quote}"`).setFooter({ text: `Powered by kanye.rest`, iconURL: process.env.ICON }).setTimestamp();
        await embed.followUp({embeds: [kanye]});
    });
    }).on("error", async (e) => {
        kanye.setThumbnail("https://media.tenor.com/4pL2t5DNPCUAAAAe/drake-drake-meme.png").setDescription("Error while fetching API Request: ```\n" + e + "\n```").setColor(0xff0000).setTimestamp();
        await embed.followUp({embeds: [kanye]});
      });
  }
}
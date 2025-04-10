const {EmbedBuilder} = require("discord.js");
const process = require("process");
const https = require ("https");
const quote = new EmbedBuilder().setTitle("Random Quote").setColor(0xf18701);
module.exports = {
  person: async function (embed) {
    await embed.deferReply();
    https.get('https://www.quoterism.com/api/quotes/random', (res) => {
        let data = "";
        res.on("data", (chunk) => {data += chunk;});
        res.on("end", async () => {
        const json = JSON.parse(data);
        quote.setDescription(`${json.text}\n~${json.author.name}`).setFooter({ text: `Powered by quoterism`, iconURL: process.env.ICON }).setTimestamp();
        await embed.followUp({embeds: [quote]});
    });
    }).on("error", async (e) => {
        quote.setDescription("Error while fetching API Request: ```\n" + e + "\n```").setColor(0xff0000).setTimestamp();
        await embed.followUp({embeds: [quote]});
      });
  }
}
const {EmbedBuilder} = require("discord.js");
const process = require("process");
const https = require ("https");
const buzzwords = new EmbedBuilder().setTitle("Corporate Bullshit Generator").setColor(0xf18701);
module.exports = {
  generate: async function (embed) {
    await embed.deferReply();
    https.get('https://corporatebs-generator.sameerkumar.website', (res) => {
        let data = "";
        res.on("data", (chunk) => {data += chunk;});
        res.on("end", async () => {
        const json = JSON.parse(data);
        buzzwords.setThumbnail("https://i.postimg.cc/sgjF7LbX/image.png").setDescription(json.phrase).setFooter({ text: `corporate-bs-generator-api`, iconURL: process.env.ICON }).setTimestamp();
        await embed.followUp({embeds: [buzzwords]});
    });
    }).on("error", async (e) => {
        buzzwords.setThumbnail("https://i.postimg.cc/tCH7QXnM/istockphoto-1759020003-612x612.jpg").setDescription("Error while fetching API Request: ```\n" + e + "\n```").setColor(0xff0000).setTimestamp();
        await embed.followUp({embeds: [buzzwords]});
      });
  }
}
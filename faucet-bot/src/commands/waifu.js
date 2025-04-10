const {EmbedBuilder} = require("discord.js");
const process = require("process");
const http = require ("https");
const host = ['waifu.it', 'api.nekosapi.com', 'api.waifu.pics', 'api.waifu.im', 'nekos.best'];
const path = [['/api/v4/waifu', '/api/v4/waifu'], ['/v4/images/random?limit=1&rating=safe'], ['/sfw/waifu', '/sfw/neko', '/sfw/shinobu', '/sfw/megumin'], ['/search'], ['/api/v2/husbando', '/api/v2/kitsune', '/api/v2/waifu', '/api/v2/neko']];
function random (min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
  }
  const waifu = new EmbedBuilder().setTitle("Random Anime Waifu/Husbando").setColor(0xf18701);
module.exports = {
  moe: async function (embed) {
    const i = random (0, 5);
    await embed.deferReply();
    const options = {
        hostname: host[i],
        path: path[i][random (0, path[i].length)],
        headers: {
            Authorization: process.env.WAIFUIT_ID
        }
    };
    http.get(options, (res) => {
        let data = "";
        res.on("data", (chunk) => {data += chunk;});
        res.on("end", async () => {
        console.log (data);
        const json = JSON.parse(data);
        waifu.setTimestamp().setFooter({ text: `Powered by ${host[i]}`, iconURL: process.env.ICON });
        switch (i){
            case 0:
                waifu.setImage(json.image.large);
                break;
            case 1:
                waifu.setImage(json[0].url);
                break;
            case 2:
                waifu.setImage(json.url);
                break;
            case 3:
                waifu.setImage(json.url);
                break;
            case 4:
                waifu.setImage(json.url);
                break;
        }
        await embed.followUp({embeds: [waifu]});
    });
    }).on("error", async (e) => {
        waifu.setDescription("Error while fetching API Request: ```\n" + e + "\n```").setColor(0xff0000).setTimestamp();
        await embed.followUp({embeds: [waifu]});
      });
  }
}
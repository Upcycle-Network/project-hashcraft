const {EmbedBuilder} = require("discord.js");
const process = require("process");
const https = require ("https");
const api = ["https://api.thecatapi.com/v1/images/search", "https://random.dog/woof.json", "https://random-d.uk/api/v2/quack", "https://randomfox.ca/floof/"];
function random (min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
  }
  const eyebleach = new EmbedBuilder().setColor(0xf18701);
module.exports = {
  bless: async function (embed) {
    const i = random (0, 4);
    await embed.deferReply();
    https.get(api[i], (res) => {
        let data = "";
        res.on("data", (chunk) => {data += chunk;});
        res.on("end", async () => {
        const json = JSON.parse(data);
        eyebleach.setTimestamp();
        switch (i){
            case 0:
                eyebleach.setTitle("Catto").setImage(json.url).setFooter({ text: `Powered by api.thecatapi.com`, iconURL: process.env.ICON });
                break;
            case 1:
                eyebleach.setTitle("Pupper").setImage(json.url).setFooter({ text: `Powered by random.dog`, iconURL: process.env.ICON });
                break;
            case 2:
                eyebleach.setTitle("Ducc").setImage(json.url).setFooter({ text: `${json.message}`, iconURL: process.env.ICON });
                break;
            case 3:
                eyebleach.setTitle("Fox").setImage(json.image).setFooter({ text: `Powered by randomfox.ca`, iconURL: process.env.ICON });
                break;
        }
        await embed.followUp({embeds: [eyebleach]});
    });
    }).on("error", async (e) => {
        eyebleach.setDescription("Error while fetching API Request: ```\n" + e + "\n```").setColor(0xff0000).setTimestamp();
        await embed.followUp({embeds: [eyebleach]});
      });
  }
}
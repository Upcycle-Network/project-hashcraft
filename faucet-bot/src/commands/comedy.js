const {EmbedBuilder} = require("discord.js");
const process = require("process");
const https = require ("https");
const api = ["https://v2.jokeapi.dev/joke/Any", "https://official-joke-api.appspot.com/jokes/random", "https://geek-jokes.sameerkumar.website/api?format=json"];
function random (min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
  }
  const comedy = new EmbedBuilder().setTitle("Bad Jokes (Please Laugh)").setColor(0xf18701);
module.exports = {
  kardo: async function (embed) {
    const i = random (0, 3);
    await embed.deferReply();
    https.get(api[i], (res) => {
        let data = "";
        res.on("data", (chunk) => {data += chunk;});
        res.on("end", async () => {
        const json = JSON.parse(data);
        comedy.setThumbnail("https://media.tenor.com/hwvGzPoZ_vwAAAAM/rage-meme-emoji-deepfry-emoji.gif").setTimestamp();
        switch (i){
            case 0:
                if (json.type == 'single'){
                    comedy.setDescription(json.joke).setFooter({ text: `Powered by jokeapi.dev`, iconURL: process.env.ICON });
                } else{
                    comedy.setTitle(json.setup).setDescription(json.delivery).setFooter({ text: `Powered by jokeapi.dev`, iconURL: process.env.ICON });
                }
                break;
            case 1:
                comedy.setTitle(json.setup).setDescription(json.punchline).setFooter({ text: `Powered by official-joke-api`, iconURL: process.env.ICON });
                break;
            case 2:
                comedy.setDescription(json.joke).setFooter({ text: `Powered by geek-jokes`, iconURL: process.env.ICON });
                break;
        }
        await embed.followUp({embeds: [comedy]});
    });
    }).on("error", async (e) => {
        comedy.setThumbnail("https://media.tenor.com/b6irvfX4ntIAAAAM/sad-crying.gif").setDescription("Error while fetching API Request: ```\n" + e + "\n```").setColor(0xff0000).setTimestamp();
        await embed.followUp({embeds: [comedy]});
      });
  }
}
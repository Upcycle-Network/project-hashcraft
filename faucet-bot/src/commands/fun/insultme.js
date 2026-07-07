const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require("discord.js");
const process = require("process");
const https = require("https");
const errorHandler = require(__dirname + '/../../errorHandler.js');
const insult = new EmbedBuilder().setTitle("An Insult for You").setColor(0xf18701);
module.exports = {
  data: new SlashCommandBuilder().setName('insultme').setDescription("Bad insults made by worse clankers"),
  execute: async function (interaction) {
    try {
      const endpoint = require(__dirname + '/../../../apiList.json');
      const apidata = endpoint.insultme;
      const options = {
        hostname: apidata[1].host,
        path: apidata[1].endpoints[0],
        headers: {
          'User-Agent': `${process.env.BOT_NAME} ${interaction.client.version}`
        },
        timeout: 1500
      };
      https.get(options, async (res) => {
        if (res.statusCode !== 200) return errorHandler.APIError(interaction, apidata[1].name + " unreachable, please try again later.", `Error Code: ${res.statusCode}`);
        let data = "";
        res.on("data", (chunk) => data += chunk);
        res.on("end", async () => {
          try {
            const json = JSON.parse(data);
            insult.setThumbnail(apidata[0].thumbnail).setDescription(json.insult).setFooter({ text: 'Powered by: ' + apidata[1].name, iconURL: process.env.ICON }).setTimestamp();
            if (process.env.DEFER === '1') await interaction.editReply({ embeds: [insult] }); else await interaction.reply({ embeds: [insult] });
          } catch (e) {
            return errorHandler.APIError(interaction, "An unexpected error occurred. Please try again later.", 'JSON parse fail')
          }
        });
      }).on('timeout', async () => {
        insult.setThumbnail(apidata[0].onError).setDescription("Error while fetching API Request: ```\nETIMEDOUT\n```").setColor(0xff0000).setTimestamp();
        if (process.env.DEFER === '1') await interaction.editReply({ embeds: [insult] }); else await interaction.reply({ embeds: [insult], flags: MessageFlags.Ephemeral });
      }).on("error", async (e) => {
        insult.setThumbnail(apidata[0].onError).setDescription("Error while fetching API Request: ```\n" + e + "\n```").setColor(0xff0000).setTimestamp();
        if (process.env.DEFER === '1') await interaction.editReply({ embeds: [insult] }); else await interaction.reply({ embeds: [insult], flags: MessageFlags.Ephemeral });
      });
    } catch (e) {
      return errorHandler.customErrorMessage(interaction, "API List Error", "The API List JSON file has incorrect syntax.\n[Report the issue](https://github.com/Upcycle-Network/project-hashcraft)", "JSON parse fail");
    }
  }
}
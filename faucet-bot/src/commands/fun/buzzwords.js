const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require("discord.js");
const process = require("process");
const https = require("https");
const errorHandler = require(__dirname + '/../../errorHandler.js');
const buzzwords = new EmbedBuilder().setTitle("Corporate Bullshit Generator").setColor(0xf18701);
module.exports = {
  data: new SlashCommandBuilder().setName('buzzwords').setDescription("Corporate Bullshit Generator"),
  execute: async function (interaction) {
    try {
      const endpoint = require(__dirname + '/../../../apiList.json');
      const apidata = endpoint.buzzwords;
      const options = {
        hostname: apidata[1].host,
        headers: {
          'User-Agent': `${process.env.BOT_NAME} ${interaction.client.version}`
        },
        timeout: 1500
      };
      let timeoutLock = false;
      https.get(options, async (res) => {
        if (res.statusCode !== 200) return errorHandler.APIError(interaction, apidata[1].name + " unreachable, please try again later.", `Error Code: ${res.statusCode}`);
        let data = "";
        res.on("data", (chunk) => data += chunk);
        res.on("end", async () => {
          if (timeoutLock) return;
          try {
            const json = JSON.parse(data);
            buzzwords.setThumbnail(apidata[0].thumbnail).setDescription(json.phrase).setFooter({ text: 'Powered by: ' + apidata[1].name, iconURL: process.env.ICON }).setTimestamp();
            if (process.env.DEFER === '1') await interaction.editReply({ embeds: [buzzwords] }); else await interaction.reply({ embeds: [buzzwords] });
          } catch (e) {
            return errorHandler.APIError(interaction, "An unexpected error occurred. Please try again later.", 'JSON parse fail')
          }
        });
      }).on('timeout', async () => {
        timeoutLock = true;
        buzzwords.setThumbnail(apidata[0].onError).setDescription("Error while fetching API Request: ```\nETIMEDOUT\n```").setColor(0xff0000).setTimestamp();
        if (process.env.DEFER === '1') await interaction.editReply({ embeds: [buzzwords] }); else await interaction.reply({ embeds: [buzzwords], flags: MessageFlags.Ephemeral });
      }).on("error", async (e) => {
        buzzwords.setThumbnail(apidata[0].onError).setDescription("Error while fetching API Request: ```\n" + e + "\n```").setColor(0xff0000).setTimestamp();
        if (process.env.DEFER === '1') await interaction.editReply({ embeds: [buzzwords] }); else await interaction.reply({ embeds: [buzzwords], flags: MessageFlags.Ephemeral });
      });
    } catch (e) {
      return errorHandler.customErrorMessage(interaction, "API List Error", "The API List JSON file has incorrect syntax.\n[Report the issue](https://github.com/Upcycle-Network/project-hashcraft)", "JSON parse fail");
    }
  }
}
const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require("discord.js");
const process = require("process");
const https = require("https");
const errorHandler = require(__dirname + '/../../errorHandler.js');
const quote = new EmbedBuilder().setColor(0xf18701);
module.exports = {
  data: new SlashCommandBuilder().setName('quote').setDescription("Quotes that resonate, provoke thought, and uplift the human spirit."),
  execute: async function (interaction) {
    try {
      const endpoint = require(__dirname + '/../../../apiList.json');
      const apidata = endpoint.quote;
      const options = {
        hostname: apidata[0].host,
        path: apidata[0].endpoints[0],
        headers: {
          'X-API-Key': process.env.QUOTERISM_API_KEY,
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
            quote.setThumbnail(json.author.imageUrl).setDescription(`${json.text}\n~${json.author.name}`).setFooter({ text: 'Powered by: ' + apidata[0].name, iconURL: process.env.ICON }).setTimestamp();
            if (process.env.DEFER === '1') await interaction.editReply({ embeds: [quote] }); else await interaction.reply({ embeds: [quote] });
          } catch (e) {
            return errorHandler.APIError(interaction, "An unexpected error occurred. Please try again later.", 'JSON parse fail')
          }
        });
      }).on('timeout', async () => {
        return errorHandler.APIError(interaction, "Error while fetching API Request: ```\nETIMEDOUT\n```", 'Connection timeout');
      }).on("error", async (e) => {
        return errorHandler.APIError(interaction, "Error while fetching API Request: ```\n" + e + "\n```", 'HTTPS Stream Interrupt');
      });
    } catch (e) {
      return errorHandler.customErrorMessage(interaction, "API List Error", "The API List JSON file has incorrect syntax.\n[Report the issue](https://github.com/Upcycle-Network/project-hashcraft)", "JSON parse fail");
    }
  }
}
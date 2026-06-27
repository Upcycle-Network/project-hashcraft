const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const process = require("process");
const errorHandler = require(__dirname + "/../../errorHandler.js");
module.exports = {
  data: new SlashCommandBuilder().setName('faucetlist').setDescription("List other Duco faucets for extra profit"),
  execute: async function (interaction) {
    try {
      const faucetList = require(__dirname + "/../../../faucetList.json");
      const faucetListEmbed = new EmbedBuilder().setTitle("List of Working Duinocoin Faucets").setColor(0xf18701).setFooter({ text: `v${interaction.client.version}`, iconURL: process.env.ICON }).setTimestamp().addFields(faucetList.faucets);
      if (process.env.DEFER === '1') await interaction.editReply({ embeds: [faucetListEmbed] }); else await interaction.reply({ embeds: [faucetListEmbed] });
    }
    catch (e) {
      return errorHandler.customErrorMessage(interaction, "Error while showing faucet list", "The Faucet List JSON file has incorrect syntax.\n[Report the issue](https://github.com/Upcycle-Network/project-hashcraft)", "JSON parse fail");
    }
  }
}

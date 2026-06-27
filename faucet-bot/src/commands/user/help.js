const {EmbedBuilder, SlashCommandBuilder} = require("discord.js");
module.exports = {
  data: new SlashCommandBuilder().setName('help').setDescription("Complete commands list for the bot."),
  async execute (interaction) {
    const commandsList = [];
    for (const command of interaction.client.commands)commandsList.push ({"name": `\`/${command[1].data.name}\``, "value": command[1].data.description});
    const help = new EmbedBuilder().setTitle("Help Section").setColor(0x2596be).addFields(commandsList).setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true, size: 32 })}).setTimestamp();
    if (process.env.DEFER === '1') await interaction.editReply({ embeds: [help] }); else await interaction.reply({ embeds: [help] });
  }
}
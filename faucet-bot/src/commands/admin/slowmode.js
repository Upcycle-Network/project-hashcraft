const { EmbedBuilder } = require("discord.js");
const process = require("process");
module.exports = {
    data: new SlashCommandBuilder().setName('slowmode').setDescription("Set a custom slow mode duration").addIntegerOption(option => option.setName("duration").setDescription("Duration in seconds").setRequired(true).setMinValue(1).setMaxValue(21600)),
    set: async function (interaction) {
        const slow = new EmbedBuilder().setFooter({ text: `v${interaction.client.version}`, iconURL: process.env.ICON }).setTimestamp();
        interaction.channel.setRateLimitPerUser(interaction.options.get("duration").value);
        slow.setAuthor({ name: `${process.env.BOT_NAME} Administration`, iconURL: process.env.SUCCESS }).setTitle("Set slowmode to " + interaction.options.get("duration").value + " seconds.").setColor(0x00ff00);
        if (process.env.DEFER === '1') await interaction.editReply({ embeds: [slow] }); else await interaction.reply({ embeds: [slow] });
    }
}
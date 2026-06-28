const process = require("process");
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const errorHandler = require(__dirname + '/../../errorHandler.js');
module.exports = {
    data: new SlashCommandBuilder().setName('purge').setDescription("Bulk delete messages newer than 14 days").addIntegerOption(option => option.setName("messages").setDescription("Number of messages").setRequired(true).setMinValue(1).setMaxValue(100)),
    execute: async function (interaction) {
        const purge = new EmbedBuilder().setFooter({ text: `v${interaction.client.version}`, iconURL: process.env.ICON }).setTimestamp();
        const param = interaction.options.get("messages").value;
        purge.setAuthor({ name: `${process.env.BOT_NAME} Administration`, iconURL: process.env.SUCCESS }).setTitle("Purged \`" + param + "\` Messages.").setColor(0x00ff00);
        try {
            await interaction.channel.bulkDelete(param);
            setTimeout(async () => {
                try {
                    await interaction.deleteReply();
                } catch (error) {
                    errorHandler.log(`[ERROR] Purge: Failed to delete reply: ${error}`);
                }
            }, 5000);
        } catch (err) {
            return errorHandler.customErrorMessage(interaction, "Purge Failed", "Error Log:\n\`\`\`\n" + err + "\n\`\`\`", interaction.client.version);
        }
        if (process.env.DEFER === '1') await interaction.editReply({ embeds: [purge] }); else await interaction.reply({ embeds: [purge] });
    }
}
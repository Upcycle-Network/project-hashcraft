const process = require("process");
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const errorHandler = require(__dirname + '/../../errorHandler.js');
String.prototype.replaceAt = function (index, replacement) {
    return this.substring(0, index) + replacement + this.substring(index + replacement.length);
}
function convert(mode, input) { //0 => convert to binary, 1 => convert to decimal
    if (!mode) return input.toString(2);
    return parseInt(input, 2);
}
function notiftag(val) {
    if (!val) return 'off';
    return 'on'
}
module.exports = {
    data: new SlashCommandBuilder().setName('notifications').setDescription("Set DM notification settings on or off.").addBooleanOption(option => option.setName("toggle").setDescription("Set true or false").setRequired(true)),
    execute: async function (interaction) {
        const notif = new EmbedBuilder().setTitle("DM Notification Settings").setColor(0xf18701).setFooter({ text: `v${interaction.client.version}`, iconURL: process.env.ICON }).setTimestamp();;
        const set = interaction.options.get("toggle").value;
        interaction.client.db.query(`select flags from Faucet where userid = ?`, [interaction.user.id], async function (err, result) {
            if (err) return errorHandler.dbQueryError(interaction, "Error", err);
            const flags = convert(0, result[0].flags);
            const notifFlag = flags.replaceAt(flags.length - 1, '' + Number(!set));
            interaction.client.db.query(`update Faucet set flags = ? where userid = ?`, [convert(1, notifFlag), interaction.user.id], async function (err) {
                if (err) return errorHandler.dbQueryError(interaction, "Error", err);
                notif.setDescription(`Notifications are now turned ${notiftag(Number(set))} for <@${interaction.user.id}>`).setColor(0x00ff00);
                if (process.env.DEFER === '1') await interaction.editReply({ embeds: [notif] }); else await interaction.reply({ embeds: [notif] });
            });
        });
    }
}
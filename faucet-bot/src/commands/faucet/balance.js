const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const process = require("process");
const errorHandler = require(__dirname + '/../../errorHandler.js');
module.exports = {
  data: new SlashCommandBuilder().setName('balance').setDescription("Check your mDU balance").addUserOption(option => option.setName("account-name").setDescription("or someone else's balance").setRequired(false)),
  execute: async function (interaction) {
    const bal = new EmbedBuilder().setTitle("mDU Balance").setColor(0xf18701).setTimestamp().setAuthor({ name: process.env.BOT_NAME + ' Faucet', iconURL: process.env.PROCESSING }).setFooter({ text: `${process.env.BOT_NAME} v${interaction.client.version}` });
    const userid = interaction.options.get("account-name")?.value ?? interaction.user.id;
    bal.setDescription(`This Discord user is not linked to their DuinoCoin wallet.\nUse \`/link\` to get started.`);
    if (!(interaction.channelId === process.env.BOT_CHANNEL || interaction.channelId === process.env.TEST_CHANNEL)) return errorHandler.wrongChannelError(interaction);
    interaction.client.db.query(`insert ignore into Faucet (userid) values (?); select wallet_name, mdu_bal, streak, last_used from Faucet where userid = ?`, [userid, userid], async function (err, result) {
      if (err) return errorHandler.dbQueryError(interaction, "Error", err);
      if (result[1][0].wallet_name == null) {
        bal.setAuthor({ name: process.env.BOT_NAME + ' Faucet', iconURL: process.env.FAIL }).setTitle(`Account not linked yet`).setColor(0xff0000);
        if (process.env.DEFER === '1') await interaction.editReply({ embeds: [bal] }); else await interaction.reply({ embeds: [bal] });
      } else {
        const dateDiffCheck = ((Math.floor(Date.now() - new Date(result[1][0].last_used))) >= 86400000) ? " ⚠" : "";
        const balance = result[1][0].mdu_bal;
        const streak = result[1][0].streak;
        bal.setDescription(`<@${userid}>'s Current Balance: \`⧈${balance}\`\nDUCO Balance:\`ↁ ${balance / 100}\`\nClaim Streak: \`${streak}${dateDiffCheck}\``).setAuthor({ name: process.env.BOT_NAME + ' Faucet', iconURL: process.env.ICON });
        if (process.env.DEFER === '1') await interaction.editReply({ embeds: [bal] }); else await interaction.reply({ embeds: [bal] });
      }
    });
  }
}
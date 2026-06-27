const process = require("process");
const dayjs = require('dayjs');
const { EmbedBuilder, SlashCommandBuilder, MessageFlags } = require("discord.js");
const errorHandler = require(__dirname + '/../../errorHandler.js');
function calculateDrop(streak) {
  if (streak <= 25) return Math.round(Math.pow(1.19775, streak) + 9);
  return Math.round((Math.log(streak) + (45 * Math.log(1.06))) / Math.log(1.06));
}
module.exports = {
  data: new SlashCommandBuilder().setName('claim').setDescription("Claim your daily mDU"),
  execute: async function (interaction) {
    const claimbox = new EmbedBuilder().setFooter({ text: `v${interaction.client.version}`, iconURL: process.env.ICON }).setTimestamp();
    if (!(interaction.channelId === process.env.BOT_CHANNEL || interaction.channelId === process.env.TEST_CHANNEL)) return errorHandler.wrongChannelError(interaction);
    const u = interaction.user.id;
    interaction.client.db.query(`insert ignore into Faucet (userid) values (?); select wallet_name, streak, last_used from Faucet where userid = ?`, [u, u], async function (err, result) {
      if (err) return errorHandler.dbQueryError(interaction, "Error", err);
      if (result[1][0].wallet_name == null) {
        claimbox.setAuthor({ name: `${process.env.BOT_NAME} Faucet`, iconURL: process.env.FAIL }).setTitle(`Account not linked yet`).setDescription(`You haven't linked your Duino-Coin Account to this discord user. Run /link to do so.`).setColor(0xff0000);
        if (process.env.DEFER === '1') await interaction.editReply({ embeds: [claimbox] }); else await interaction.reply({ embeds: [claimbox] });
      } else {
        var streak = result[1][0].streak;
        const use = new Date(result[1][0].last_used);
        const now = new Date();
        const timediff = Math.floor((now.getTime() - use) / 86400000);
        switch (timediff) {
          case 0:
            const cooldown = new Date(use).getTime() + 86400000;
            claimbox.setAuthor({ name: `${process.env.BOT_NAME} Faucet`, iconURL: process.env.FAIL }).setTitle(`Don't be Greedy!`).setDescription(`You have claimed already. Try again <t:${Math.floor(cooldown / 1000)}:R>`).setColor(0xff0000);
            if (process.env.DEFER === '1') await interaction.editReply({ embeds: [claimbox] }); else await interaction.reply({ embeds: [claimbox] });
            break;
          default:
            console.log(timediff);
            const prevStreak = streak;
            streak = (timediff === 1) ? (streak + 1) : 1;
            const drop = calculateDrop(streak);
            claimbox.setAuthor({ name: `${process.env.BOT_NAME} Faucet`, iconURL: process.env.SUCCESS }).setTitle(`Claim Successful`).setDescription(`Drop: \`⧈${drop}\`\nCurrent streak: ${streak}`).setColor(0x00ff00);
            if (timediff > 1 && use.getTime() !== 0) claimbox.setDescription(`Drop: \`⧈${drop}\`\nYou lost your streak of ${prevStreak}`);
            else if (use.getTime() === 0) streak = 1;
            interaction.client.db.query(`update Faucet set mdu_bal = mdu_bal + ?, claims = claims + 1, streak = ?, last_used = ?, reminder = ? where userid = ?;`, [drop, streak, now, now, u], async function (err) {
              if (err) return errorHandler.dbQueryError(interaction, "Error", err);
              if (process.env.DEFER === '1') await interaction.editReply({ embeds: [claimbox] }); else await interaction.reply({ embeds: [claimbox] });
            });
            break;
        }
      }
    });
  }
}
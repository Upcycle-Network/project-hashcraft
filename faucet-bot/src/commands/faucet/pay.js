const process = require("process");
const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require("discord.js");
const errorHandler = require(__dirname + "/../../errorHandler");
module.exports = {
  data: new SlashCommandBuilder().setName('pay').setDescription("Send mDU from one account to another").addUserOption(option => option.setName("recipient").setDescription("Enter recipient user").setRequired(true)).addIntegerOption(option => option.setName("amount").setDescription("Enter amount to pay in mDU").setRequired(true).setMinValue(1)),
  execute: async function (interaction) {
    const userid = interaction.user.id
    const uid = interaction.options.get("recipient").value;
    const txnamt = interaction.options.get("amount").value;
    const payembed = new EmbedBuilder().setTitle("Confirm Payment").setColor(0xf18701).setAuthor({ name: `${process.env.BOT_NAME} Payments`, iconURL: process.env.PROCESSING }).setFooter({ text: `v${interaction.client.version}`, iconURL: process.env.ICON }).setTimestamp().setDescription(`Pay \`⧈${txnamt}\` to <@${uid}>?`);
    const payconfirm = new ButtonBuilder().setCustomId("payconfirm").setLabel("Confirm ⧈ mDU Payment").setStyle(ButtonStyle.Success).setDisabled(false);
    const cancel = new ButtonBuilder().setCustomId("cancel").setLabel("Cancel").setStyle(ButtonStyle.Danger).setDisabled(false);
    const filter = (i) => i.user.id === userid;
    const paycomponents = new ActionRowBuilder().addComponents(cancel, payconfirm);
    interaction.client.db.query(`insert ignore into Faucet (userid) values (?); select wallet_name, mdu_bal from Faucet where userid = ?; insert ignore into Faucet (userid) values (?); select wallet_name from Faucet where userid = ?;`, [userid, userid, uid, uid], async function (err, result) {
      if (err) return errorHandler.dbQueryError(interaction, 'Error', err);
      if (result[1][0].wallet_name == null) {
        payembed.setAuthor({ name: process.env.BOT_NAME + ' Payments', iconURL: process.env.FAIL }).setTitle(`Account not linked yet`).setDescription(`You haven't linked your Duino-Coin Account to this discord user. Run /link to do so.`).setColor(0xff0000);
        if (process.env.DEFER === '1') await interaction.editReply({ embeds: [payembed] }); else await interaction.reply({ embeds: [payembed] });
      } else if (result[3][0].wallet_name == null) {
        payembed.setAuthor({ name: process.env.BOT_NAME + ' Payments', iconURL: process.env.FAIL }).setTitle(`Account not linked`).setDescription(`User <@${uid}> has not linked a wallet to their UserID.`).setColor(0xff0000);
        if (process.env.DEFER === '1') await interaction.editReply({ embeds: [payembed] }); else await interaction.reply({ embeds: [payembed] });
      } else {
        const userbal = result[1][0].mdu_bal;
        if (userbal >= txnamt) {
          const paycheck = (process.env.DEFER === '1') ? await interaction.editReply({ embeds: [payembed], components: [paycomponents] }) : await interaction.reply({ embeds: [payembed], components: [paycomponents] });
          const paycollector = paycheck.createMessageComponentCollector({ componentType: ComponentType.Button, filter, time: 15_000, });
          paycollector.on("collect", async (payInteraction) => {
            if (payInteraction.customId == 'payconfirm') {
              cancel.setDisabled(true).setStyle(ButtonStyle.Secondary);
              payconfirm.setDisabled(true);
              payembed.setColor(0x00ff00).setAuthor({ name: `${process.env.BOT_NAME} Payments`, iconURL: process.env.SUCCESS });
              if (process.env.DEFER === '1') {
                await interaction.editReply({ embeds: [payembed], components: [paycomponents] });
                await payInteraction.deferReply();
              }
              interaction.client.db.query(`update Faucet set mdu_bal = mdu_bal - ? where Faucet.userid = ?; update Faucet set mdu_bal = mdu_bal + ? where Faucet.userid = ?;`, [txnamt, userid, txnamt, uid],
                async function (err) {
                  if (err) return errorHandler.dbQueryError(payInteraction, 'Error', err);
                  payembed.setAuthor({ name: `${process.env.BOT_NAME} Payments`, iconURL: process.env.SUCCESS }).setColor(0x00ff00).setTitle("Payment Successful").setDescription(`Paid \`⧈${txnamt}\` to <@${uid}>`).setTimestamp();
                  if (process.env.DEFER === '1') await payInteraction.editReply({ embeds: [payembed] }); else await payInteraction.update({ embeds: [payembed], components: [paycomponents] });
                });
            } else if (payInteraction.customId == 'cancel') {
              cancel.setDisabled(true)
              payconfirm.setDisabled(true).setStyle(ButtonStyle.Secondary);;
              payembed.setAuthor({ name: `${process.env.BOT_NAME} Payments`, iconURL: process.env.FAIL }).setColor(0xff0000).setTitle("Payment Canceled").setDescription(`by <@${userid}>`).setTimestamp();
              await payInteraction.update({ embeds: [payembed], components: [paycomponents] });
            }
          });
          paycollector.on("end", async () => {
            payembed.setTitle("Session Expired").setDescription(`Payment of \`⧈${txnamt}\` from <@${userid}> to <@${uid}>`).setAuthor({ name: `${process.env.BOT_NAME} Payments`, iconURL: process.env.INFO }).setColor(0x0402fd);
            payconfirm.setDisabled(true);
            cancel.setDisabled(true);
            await interaction.editReply({ embeds: [payembed], components: [paycomponents] });
          });
        } else return errorHandler.lowBalanceError(interaction, userbal);
      }
    });

  }
}
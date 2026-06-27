const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const process = require("process");
const https = require("https");
const errorHandler = require(__dirname + "/../../errorHandler");
module.exports = {
  data: new SlashCommandBuilder().setName('deposit').setDescription("Send mDU from your discord account to your DuinoCoin Wallet").addIntegerOption(option => option.setName("amount").setDescription("Enter amount in mDU").setRequired(true).setMinValue(1)),
  execute: async function (interaction) {
    const userid = interaction.user.id;
    const deposit = new EmbedBuilder().setAuthor({ name: `${process.env.BOT_NAME} Faucet`, iconURL: process.env.PROCESSING }).setColor(0xf18701).setFooter({ text: `v${interaction.client.version}`, iconURL: process.env.ICON }).setTimestamp();
    if (!(interaction.channelId === process.env.BOT_CHANNEL || interaction.channelId === process.env.TEST_CHANNEL)) return errorHandler.wrongChannelError(interaction);
    if (process.env.MAINTENANCE_MODE === 'true') return errorHandler.maintenanceMode(interaction);
    interaction.client.db.query(`select mdu_bal, wallet_name from Faucet where userid = ?`, [userid], async function (err, result) {
      if (err) return errorHandler.dbQueryError(interaction, 'Error', err);
      const bal = result[0].mdu_bal;
      const dep = interaction.options.get("amount").value;
      const recip = result[0].wallet_name;
      if (recip === null) return errorHandler.customErrorMessage(interaction, 'Account not linked yet', `You haven't linked your Duino-Coin Account to this discord user. Run /link to do so.`, process.env.BOT_NAME);
      if (bal < dep) return errorHandler.customErrorMessage(interaction, `You don't have enough mDU!`, "Current balance: ⧈" + bal, process.env.BOT_NAME);
      if (process.env.TXN_HANDLER === 'self') {
        const url = `https://server.duinocoin.com/transaction/?username=` + encodeURIComponent(process.env.MASTER_USER) + `&password=` + encodeURIComponent(process.env.MASTER_KEY) + `&recipient=` + encodeURIComponent(recip) + `&amount=` + encodeURIComponent(dep / 100) + `&memo=HashCraft Faucet https://discord.gg/vH8fxYZcr8`;
        https.get(url, (res) => {
          if (res.statusCode !== 200) return errorHandler.APIError(interaction, "Transaction cannot be completed. Please try again later.", `Error Code: ${res.statusCode}`);
          let data = "";
          res.on("data", (chunk) => data += chunk);
          res.on("end", async () => {
            try {
              const json = JSON.parse(data);
              if (!json.success) return errorHandler.APIError(interaction, 'Deposit Failed', 'DUCO  API Error');
              interaction.client.db.query(`update Faucet set mdu_bal = ? where Faucet.userid = ?; update Faucet set mdu_bal = mdu_bal + ?, claims = claims + 1 where Faucet.userid = 1;`, [bal - dep, userid, dep], async function (err) {
                if (err) return errorHandler.dbQueryError(interaction, 'Error', err);
                const txid = String(json.result).split(",")[2];
                deposit.setAuthor({ name: `${process.env.BOT_NAME} Faucet`, iconURL: process.env.SUCCESS }).setTitle("Deposit Successful").setColor(0x00ff00).setDescription(`Successfully converted \`⧈${dep}\` into \`${dep / 100} ↁ\` and sent to Account: ${recip}\nTxID: [${txid}](https://explorer.duinocoin.com?search=${txid})`).setTimestamp();
                if (process.env.DEFER === '1') await interaction.editReply({ embeds: [deposit] }); else await interaction.reply({ embeds: [deposit] });
              });
            } catch (e) {
              return errorHandler.APIError(interaction, 'Deposit Failed', 'JSON parse fail');
            }
          });
        }).on("error", async (e) => { return errorHandler.APIError(interaction, 'Deposit Failed', e.code); });
      } else {
        const transactionMessage = JSON.stringify({
          'userid': userid,
          'walletName': recip,
          'deposit': dep,
          'key': process.env.EVENT_KEY
        });
        const options = {
          hostname: process.env.TXN_HANDLER,
          port: 443,
          path: '/transaction',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': transactionMessage.length
          }
        }
        https.request(options, async (res) => {
          if (res.statusCode !== 200 && res.statusCode !== 201) return errorHandler.APIError(interaction, "Transaction node is unreachable. Please try again later.", `Error Code: ${res.statusCode}`);
          var requestData = '';
          res.on("data", (chunk) => postData += chunk);
          try {
            const jsonData = JSON.parse(requestData);
            if (!jsonData.success) return errorHandler.APIError(interaction, 'Transaction node malfunction. Please try again later.', 'JSON Key Mismatch');
            deposit.setAuthor({ name: `${process.env.BOT_NAME} Faucet`, iconURL: process.env.SUCCESS }).setTitle("Deposit Successful").setColor(0x00ff00).setDescription(`Funds will arrive in your DuinoCoin Wallet at \`00:00\` UTC`).setTimestamp();
            return (process.env.DEFER === '1') ? await interaction.editReply({ embeds: [deposit] }) : await interaction.reply({ embeds: [deposit] });
          } catch (e) {
            errorHandler.APIError(interaction, "Transaction node error. Please try again later.", "JSON parse fail");
          }
        }).on("error", async (e) => { return errorHandler.APIError(interaction, 'Transaction node deposit failed', e.code); });
      }
    });
  }
}
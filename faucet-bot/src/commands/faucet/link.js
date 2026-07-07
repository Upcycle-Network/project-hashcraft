const process = require("process");
const http = require("http");
const errorHandler = require(__dirname + '/../../errorHandler.js');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, SlashCommandBuilder } = require("discord.js");
module.exports = {
  data: new SlashCommandBuilder().setName('link').setDescription("Link your DuinoCoin wallet to this faucet.").addStringOption(option => option.setName("account-name").setDescription("Enter your DuinoCoin Username").setRequired(true)),
  execute: async function (interaction) {
    const confirmbox = new EmbedBuilder().setAuthor({ name: `${process.env.BOT_NAME} Registration`, iconURL: process.env.PROCESSING }).setTitle("Link Account to User").setColor(0xff0000).setFooter({ text: `v${interaction.client.version}`, iconURL: interaction.guild.iconURL({ dynamic: true, size: 32 }) }).setTimestamp();
    const confirm = new ButtonBuilder().setCustomId("confirm").setLabel("Confirm").setStyle(ButtonStyle.Success).setDisabled(false);
    const cancel = new ButtonBuilder().setCustomId("cancel").setLabel("Cancel").setStyle(ButtonStyle.Danger).setDisabled(false);
    const remove = new ButtonBuilder().setCustomId("remove").setLabel("Remove").setStyle(ButtonStyle.Danger).setDisabled(false);
    const choice = new ActionRowBuilder().setComponents(cancel, confirm);
    if (!(interaction.channelId === process.env.BOT_CHANNEL || interaction.channelId === process.env.TEST_CHANNEL)) return errorHandler.wrongChannelError(interaction);
    const u = interaction.user.id;
    const walletname = String(interaction.options.get("account-name").value);
    interaction.client.db.query(`insert ignore into Faucet (userid) values (?); select wallet_name from Faucet where userid = ?; select userid from Faucet where wallet_name = ?`, [u, u, walletname], async function (err, result) {
      if (err) return errorHandler.dbQueryError(interaction, 'Error', err);
      if (!result[1][0].wallet_name) {
        try {
          const endpoint = require(__dirname + '/../../../apiList.json');
          const apidata = endpoint.duco;
          const options = {
            hostname: apidata[0].host,
            path: apidata[0].endpoints[0] + interaction.options.get('account-name').value,
            headers: {
              'User-Agent': `${process.env.BOT_NAME} ${interaction.client.version}`
            },
            timeout: (process.env.DEFER === '1') ? 5000 : 2000
          };
          let timeoutLock = false;
          http.get(options, async (res) => {
            if (res.statusCode !== 200) return errorHandler.APIError(interaction, "Wallet name cannot be verified. Please try again in some time.", `Error Code: ${res.statusCode}`);
            var data = '';
            res.on("data", (chunk) => data += chunk);
            res.on("end", async () => {
              if (timeoutLock) return;
              try {
                const jsonData = JSON.parse(data);
                if (!jsonData.success) return errorHandler.customErrorMessage(interaction, "Link Wallet", "Error: " + String(jsonData.message), process.env.BOT_NAME);
                confirmbox.setDescription("Confirm Account Link: " + String(interaction.options.get("account-name").value)).setColor(0xffff00).setTimestamp();
                const rep = (process.env.DEFER === '1') ? await interaction.editReply({ embeds: [confirmbox], components: [choice] }) : await interaction.reply({ embeds: [confirmbox], components: [choice] });
                const collector = rep.createMessageComponentCollector({ componentType: ComponentType.Button, time: 30_000, });
                collector.on("collect", async (linkInteraction) => {
                  if (linkInteraction.user.id !== u) errorHandler.wrongUserError(linkInteraction);
                  switch (linkInteraction.customId) {
                    case "confirm":
                      cancel.setStyle(ButtonStyle.Secondary);
                      if (result[2].length === 0) {
                        interaction.client.db.query(`update Faucet set wallet_name = ? where Faucet.userid = ?;`, [walletname, u], async function (err) {
                          confirm.setDisabled(true);
                          cancel.setDisabled(true);
                          if (err) errorHandler.dbQueryError(interaction, "Link " + String(interaction.options.get("account-name").value) + " Failed", err);
                          else confirmbox.setTitle("Linked Account " + String(interaction.options.get("account-name").value) + " Successfully.").setDescription("Run /claim to get your daily ⧈ mDU").setColor(0x00ff00).setAuthor({ name: `${process.env.BOT_NAME} Registration`, iconURL: process.env.SUCCESS }).setTimestamp();
                          await linkInteraction.update({ embeds: [confirmbox], components: [choice] });
                        });
                      } else {
                        confirmbox.setAuthor({ name: `${process.env.BOT_NAME} Registration`, iconURL: process.env.FAIL }).setTitle("Detected Alternate Account").setDescription(`Come back with your main, <@${result[2][0].userid}>`).setColor(0xff0000).setTimestamp();
                        confirm.setStyle(ButtonStyle.Danger).setDisabled(true);
                        cancel.setDisabled(true);
                        await linkInteraction.update({ embeds: [confirmbox], components: [choice] });
                      }
                      break;
                    case "cancel":
                      confirmbox.setAuthor({ name: `${process.env.BOT_NAME} Registration`, iconURL: process.env.FAIL }).setTitle("Cancelled linking account " + String(interaction.options.get("account-name").value)).setDescription("Abort.").setColor(0xff0000).setTimestamp();
                      confirm.setStyle(ButtonStyle.Secondary).setDisabled(true);
                      cancel.setDisabled(true);
                      await linkInteraction.update({ embeds: [confirmbox], components: [choice] });
                      break;
                  }
                });
                collector.on("end", async () => {
                  confirm.setDisabled(true);
                  cancel.setDisabled(true);
                  confirmbox.setAuthor({ name: `${process.env.BOT_NAME} Registration`, iconURL: process.env.INFO }).setTitle("Linking account " + String(interaction.options.get("account-name").value)).setDescription("Session Expired").setColor(0x0402fd).setTimestamp();
                  await interaction.editReply({ embeds: [confirmbox], components: [choice] });
                });
              } catch (e) {
                return errorHandler.APIError(interaction, "Wallet name cannot be verified. Please try again in some time.", "JSON parse fail");
              }
            });
          }).on('timeout', async () => {
            timeoutLock = true;
            return errorHandler.APIError(interaction, "Error while fetching API Request: ```\nETIMEDOUT\n```", 'Connection timeout');
          })
            .on("error", async (e) => { return errorHandler.APIError(interaction, 'Transaction node deposit failed', e.code); });
        } catch (e) {
          return errorHandler.customErrorMessage(interaction, "API List Error", "The API List JSON file has incorrect syntax.\n[Report the issue](https://github.com/Upcycle-Network/project-hashcraft)", "JSON parse fail");
        }
      } else {
        choice.setComponents(remove);
        confirmbox.setAuthor({ name: `${process.env.BOT_NAME} Registration`, iconURL: process.env.INFO }).setTitle("Wallet is already linked").setDescription(result[1][0].wallet_name).setColor(0x0402fd);
        const link = (process.env.DEFER === '1') ? await interaction.editReply({ embeds: [confirmbox], components: [choice] }) : await interaction.reply({ embeds: [confirmbox], components: [choice] });
        const removeCollector = link.createMessageComponentCollector({ componentType: ComponentType.Button, time: 10_000, });
        removeCollector.on("collect", async (removeInteraction) => {
          if (removeInteraction.user.id !== u) errorHandler.wrongUserError(removeInteraction);
          interaction.client.db.query(`update Faucet set wallet_name = null where Faucet.userid = ?;`, [u], async function (err) {
            if (err) {
              confirmbox.setAuthor({ name: `${process.env.BOT_NAME} Registration`, iconURL: process.env.FAIL }).setTitle("Link " + String(interaction.options.get("account-name").value) + " Failed").setDescription("DB Query Failed, Error Message: \n\`\`\`\n" + err + "\n\`\`\`\nPlease try again.").setColor(0xff0000).setTimestamp();
              remove.setStyle(ButtonStyle.Secondary);
            } else {
              confirmbox.setTitle("Unlinked Account " + result[1][0].wallet_name + " successfully.").setDescription("We're sad to see you go :(").setColor(0x00ff00).setAuthor({ name: `${process.env.BOT_NAME} Registration`, iconURL: process.env.SUCCESS }).setTimestamp();
              remove.setStyle(ButtonStyle.Secondary).setDisabled(true);
            }
            await removeInteraction.update({ embeds: [confirmbox], components: [choice] });
          });
        });
        removeCollector.on("end", async () => {
          remove.setDisabled(true);
          await interaction.editReply({ components: [choice] });
        });
      }
    });
  }
}
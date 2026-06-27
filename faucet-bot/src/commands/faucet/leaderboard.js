const { SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, ComponentType, EmbedBuilder } = require("discord.js");
const process = require("process");
const errorHandler = require(__dirname + "/../../errorHandler");
const leaderboard = new EmbedBuilder().setTitle("Faucet Leaderboard").setColor(0xf18701).setDescription(`Select a list from below.`);
module.exports = {
  data: new SlashCommandBuilder().setName('leaderboard').setDescription("Check out the most active users of the faucet"),
  execute: async function (interaction) {
    const options = [
      {
        label: '⧈ mDU Leaderboard',
        description: 'Biggest bank in the kolka-verse',
        value: 'mdu'
      },
      {
        label: 'Streak Leaderboard',
        description: 'Consistency is key',
        value: 'str'
      },
      {
        label: 'Claim Leaderboard',
        description: 'Top faucet users',
        value: 'clm'
      },
    ];
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId(interaction.id)
      .setPlaceholder('Choose Leaderboard')
      .setMinValues(0)
      .setMaxValues(1)
      .addOptions(
        options.map((opt) => new StringSelectMenuOptionBuilder()
          .setLabel(opt.label)
          .setDescription(opt.description)
          .setValue(opt.value)
        )
      );
    const actionRow = new ActionRowBuilder().addComponents(selectMenu);
    interaction.client.db.query(`select userid from Faucet where userid > 100 order by mdu_bal desc;
                     select mdu_bal from Faucet where userid > 100 order by mdu_bal desc;
                     select userid from Faucet where userid > 100 order by streak desc;
                     select streak from Faucet where userid > 100 order by streak desc;
                     select userid from Faucet where userid > 100 order by claims desc;
                     select claims from Faucet where userid > 100 order by claims desc;`, async function (err, result) {
      if (err) return errorHandler.dbQueryError(interaction, "Error", err);
      var defaultLb = '';
      defaultLb = `~~------------------------------~~\n**mDU Balance**\n`;
      for (m = 0; m <= 9; m++) defaultLb = defaultLb + `${m + 1}.\t<@${result[0][m].userid}> -- \`⧈${result[1][m].mdu_bal}\`\n`;
      leaderboard.setDescription(defaultLb);
      const reply = (process.env.DEFER === '1') ? await interaction.editReply({ embeds: [leaderboard], components: [actionRow] }) : await interaction.reply({ embeds: [leaderboard], components: [actionRow] });
      const collector = reply.createMessageComponentCollector({
        componentType: ComponentType.StringSelect,
        filter: (i) => i.user.id === interaction.user.id && i.customId === interaction.id,
        time: 60_000,
      });
      collector.on('collect', async (menuInteraction) => {
        var content = '';
        if (!menuInteraction.values.length) {
          content = `~~------------------------------~~\n**mDU Balance**\n`;
          for (m = 0; m <= 9; m++)  content = content + `${m + 1}.\t<@${result[0][m].userid}> -- \`⧈${result[1][m].mdu_bal}\`\n`;
          leaderboard.setDescription(content);
          await menuInteraction.update({ embeds: [leaderboard] });
        } else {
          switch (menuInteraction.values[0]) {
            case 'mdu':
              content = `~~------------------------------~~\n**mDU Balance**\n`;
              for (m = 0; m <= 9; m++) content = content + `${m + 1}.\t<@${result[0][m].userid}> -- \`⧈${result[1][m].mdu_bal}\`\n`;
              break;
            case 'str':
              content = content + `~~------------------------------~~\n**Streak**\n`;
              for (s = 0; s <= 9; s++) content = content + `${s + 1}.\t<@${result[2][s].userid}> -- \`${result[3][s].streak}\`\n`;
              break;
            case 'clm':
              content = content + `~~------------------------------~~\n**Claims**\n`;
              for (c = 0; c <= 9; c++) content = content + `${c + 1}.\t<@${result[4][c].userid}> -- \`${result[5][c].claims}\`\n`;
              break;
          }
          leaderboard.setDescription(content);
          await menuInteraction.update({ embeds: [leaderboard] });
        }
      });
      collector.on("end", async () => {
        await interaction.editReply({ components: [] });
      });

    });
  }
}
const {StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, ComponentType, EmbedBuilder} = require("discord.js");
const process = require("process");
const leaderboard = new EmbedBuilder().setTitle("Faucet Leaderboard").setColor(0xf18701).setDescription(`Select a list from below.`);
module.exports = {
  show: async function (embed, con) {
    await embed.deferReply();
    con.getConnection(async function (err, conlb) {
      if (err) {
        leaderboard.setDescription(`Error Connecting to DB.\nError Message: \`\`\`\n${err}\n\`\`\``).setColor(0xff0000);
        await embed.editReply({ embeds: [leaderboard] });
      } else {
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
        .setCustomId(embed.id)
        .setPlaceholder('Choose Leaderboard')
        .setMinValues (0)
        .setMaxValues (3)
        .addOptions (
          options.map((opt) => new StringSelectMenuOptionBuilder()
          .setLabel(opt.label)
          .setDescription(opt.description)
          .setValue(opt.value)
        )
        );
        const actionRow = new ActionRowBuilder().addComponents(selectMenu);
        const reply = await embed.editReply({ embeds: [leaderboard], components: [actionRow] });
        conlb.query(`select userid from Faucet where userid > 100 order by mdu_bal desc;
                     select mdu_bal from Faucet where userid > 100 order by mdu_bal desc;
                     select userid from Faucet where userid > 100 order by streak desc;
                     select streak from Faucet where userid > 100 order by streak desc;
                     select userid from Faucet where userid > 100 order by claims desc;
                     select claims from Faucet where userid > 100 order by claims desc;`, async function (err, result){
        if (err){
          leaderboard.setDescription(`DB Query Failed:\n\`\`\`\n${err}\n\`\`\``).setColor(0xff0000);
          await embed.editReply({ embeds: [leaderboard] });
        } else {
        const reply = await embed.editReply({ embeds: [leaderboard], components: [actionRow] });
        const collector = reply.createMessageComponentCollector({
          componentType: ComponentType.StringSelect,
          filter: (i) => i.user.id === embed.user.id && i.customId === embed.id,
          time: 120_000,
        });
        collector.on('collect', async (interaction) => {
          var content = '';
          if (!interaction.values.length){
            leaderboard.setDescription(`Select a list from below.`);
            await interaction.update({ embeds: [leaderboard] });
          } else {
            for (i = 0; i <= interaction.values.length; i++){
            switch(interaction.values[i]){
              case 'mdu':
                content = `~~------------------------------~~\n**mDU Balance**\n`;
                for (m=0; m <= 9; m++){
                  content = content + `${m+1}.\t<@${result[0][m].userid}> -- \`⧈${result[1][m].mdu_bal}\`\n`;
                }
                break;
              case 'str':
                content = content + `~~------------------------------~~\n**Streak**\n`;
                 for (s=0; s <= 9; s++){
                  content = content + `${s+1}.\t<@${result[2][s].userid}> -- \`${result[3][s].streak}\`\n`;
                }
                break;
              case 'clm':
                content = content + `~~------------------------------~~\n**Claims**\n`;
                for (c=0; c <= 9; c++){
                  content = content + `${c+1}.\t<@${result[4][c].userid}> -- \`${result[5][c].claims}\`\n`;
                }
                break;
            }
            }
            leaderboard.setDescription(content);
            await interaction.update({ embeds: [leaderboard] });
          }
        });
        }
        });
      }
      conlb.release();
    });
  }
}
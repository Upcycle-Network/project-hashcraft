const {EmbedBuilder} = require("discord.js");
const process = require("process");
const leaderboard = new EmbedBuilder().setTitle("Faucet Leaderboard").setColor(0xf18701);
module.exports = {
  west: async function (embed, userid, con) {
    await embed.deferReply();
    con.getConnection(async function (err, conlb) {
      if (err) {
        await embed.editReply({ embeds: [leaderboard] });
      } else {
        conlb.query(`select userid from Faucet where userid > 100 order by mdu_bal desc;
                     select mdu_bal from Faucet where userid > 100 order by mdu_bal desc`, async function (err, result){

        });
      }
      conlb.release();
    });
  }
}
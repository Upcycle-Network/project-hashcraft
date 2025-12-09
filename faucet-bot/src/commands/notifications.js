const process = require("process");
const { EmbedBuilder } = require("discord.js");
const notif = new EmbedBuilder().setTitle("DM Notification Settings").setColor(0xf18701).setFooter({ text: `v${process.env.BOT_VERSION}`, iconURL: process.env.ICON }).setTimestamp();
String.prototype.replaceAt = function(index, replacement) {
    return this.substring(0, index) + replacement + this.substring(index + replacement.length);
}
function convert (mode, input){
    if (!mode) return input.toString(2);
    return parseInt(input, 2);
}
function notiftag (val){
    if(!val) return 'off';
    return 'on'
}
module.exports = {
    toggle: async function (embed, userid, con) {
        const set = embed.options.get("toggle").value;
        await embed.deferReply();
        con.getConnection(async function (err, contog) {
        if (err) {
        notif.setTitle("Error Connecting to DB.").setDescription(`Message:\n\`\`\`\n ${err} \n\`\`\``).setColor(0xff0000);
        await embed.editReply({ embeds: [notif] });
      } else {
        contog.query(`select flags from Faucet where userid = ${userid}`, async function (err, result){
            if (err){
                notif.setTitle("DB Query Failed").setDescription(`Message:\n\`\`\`\n ${err} \n\`\`\``).setColor(0xff0000);
                await embed.editReply({ embeds: [notif] });
            } else {
            const flags = convert(0, result[0].flags);
            const notifFlag = flags.replaceAt(flags.length - 1, '' + Number(!set));
            contog.query (`update Faucet set flags = ${convert(1, notifFlag)} where userid = ${userid}`, async function (err){
                if (err){
                notif.setTitle("DB Query Failed").setDescription(`Message:\n\`\`\`\n ${err} \n\`\`\``).setColor(0xff0000);
                await embed.editReply({ embeds: [notif] });
                } else {
                    notif.setDescription(`Notifications are now turned ${notiftag(Number(set))} for <@${userid}>`).setColor(0x00ff00);
                    await embed.editReply({ embeds: [notif] });
                }
            });
            }
        });
      }
      contog.release();
    });
    },
    notifFlag: function (val){
        const temp = convert(0, val);
        return temp.charAt(temp.length - 1);
}
}

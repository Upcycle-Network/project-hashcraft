const process = require("process");
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, MessageFlags, SlashCommandBuilder } = require("discord.js");
module.exports = {
        data: new SlashCommandBuilder().setName('restart').setDescription("**Developer Command**: Restarts the bot process."),
        async execute (interaction) {
        const messageEpoch = Math.floor(Date.now() / 1000);
        const restart = new EmbedBuilder().setTitle("Confirm Bot Restart").setColor(0x8c3f7a).setAuthor({ name: `${interaction.guild.name} Administration`, iconURL: process.env.PROCESSING }).setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true, size: 32 })}).setTimestamp();
        if(interaction.user.id == process.env.APP_DEV_USERID){
        const restartConfirm = new ButtonBuilder().setCustomId("restart").setLabel("Restart").setStyle(ButtonStyle.Danger).setDisabled(false);
        const component = new ActionRowBuilder().addComponents(restartConfirm);
        const rstreply = (process.env.DEFER === '1') ? await interaction.editReply({ embeds: [restart], components: [component] }) : await interaction.reply({ embeds: [restart], components: [component] });
        const collect = rstreply.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 25_000,
          });
        collect.on("collect", async (rstInteraction) => {
            if (rstInteraction.user.id != process.env.APP_DEV_USERID) return rstInteraction.reply({embeds: [new EmbedBuilder().setTitle("This command is not for you!")], flags: MessageFlags.Ephemeral});
            if (rstInteraction.customId == 'restart'){
                const buttonEpoch = Math.floor(Date.now() / 1000);
                process.env.RESTART_FLAG = '1';
                restartConfirm.setDisabled(true).setStyle(ButtonStyle.Success);
                await interaction.editReply({ embeds: [restart], components: [component], });
            restart.setAuthor({ name: `${interaction.guild.name} Administration`, iconURL: process.env.SUCCESS }).setColor(0x00ff00).setTitle("Restarting...").setDescription(`Bot restarts <t:${messageEpoch + (25 - (buttonEpoch - messageEpoch))}:R> from now.`).setTimestamp();
            await rstInteraction.update({ embeds: [restart] });
            }
            interaction.client.user.setPresence({status: 'dnd'});
            setTimeout(() => {
            console.log('[INFO] Bot stopping on command.');
            process.exit();
        }, 15000);
        });
        
        collect.on("end", async () => {
            setTimeout(() => interaction.client.user.setPresence({status: 'idle'}), 25000);
            restart.setAuthor({ name: `${interaction.guild.name} Administration`, iconURL: process.env.FAIL }).setColor(0xff0000).setTitle("Restart Abort").setDescription(`Bot restart cancelled.`).setTimestamp();
            await interaction.editReply({embeds: [restart], components: [],});
            process.env.RESTART_FLAG = '0';
        });
    } else {
        restart.setTitle("Permission Denied").setDescription("Only the creator, KosmicDaKerbal is allowed to restart the bot.").setColor(0xff0000);
        await interaction.followUp({embeds: [restart], flags: MessageFlags.Ephemeral});
    }
  }
}
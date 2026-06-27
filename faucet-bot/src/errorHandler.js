const { EmbedBuilder, MessageFlags } = require('discord.js');
const process = require("process");
const asyncfs = require("fs/promises");
async function sendErrorMessage(interaction, embed, force) {
    return (process.env.DEFER === '1' && force === 0) ? await interaction.editReply({ embeds: [embed] }) : await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
}
async function writeToLog(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    try {
        await asyncfs.appendFile(__dirname + '/hashcraft.log', logMessage, 'utf8');
    } catch (err) {
        console.error('[ERROR] Failed to write to log file:', err);
    }
}
module.exports = {
    eventAPIMessage: async function (response, message, sendHeaderFlag, logType) {
        writeToLog(`EVENT_${logType}: ${message}`);
        if (sendHeaderFlag) response.writeHead(200, { 'Content-Type': 'text/plain' });
        response.write(message);
        response.end();
    },
    dbQueryError: async function (interaction, title, err) {
        const error = new EmbedBuilder().setTitle(title).setDescription("DB Query Failed, Error Message: \n\`\`\`\n" + err + "\n\`\`\`\nPlease try again.").setAuthor({ name: process.env.BOT_NAME, iconURL: process.env.FAIL }).setColor(0xff0000).setFooter({ text: process.env.BOT_NAME, iconURL: interaction.guild.iconURL({ dynamic: true, size: 32 }) }).setTimestamp();
        sendErrorMessage(interaction, error, 0);
    },
    APIError: async function (interaction, description, reason) {
        const error = new EmbedBuilder().setTitle("API Server Error").setDescription(description).setAuthor({ name: process.env.BOT_NAME, iconURL: process.env.FAIL }).setColor(0xff0000).setFooter({ text: reason, iconURL: interaction.guild.iconURL({ dynamic: true, size: 32 }) }).setTimestamp();
        sendErrorMessage(interaction, error, 0);
    },
    wrongUserError: async function (interaction) {
        const error = new EmbedBuilder().setTitle("Unauthorized Interaction").setDescription("This command is not for you!").setAuthor({ name: process.env.BOT_NAME, iconURL: process.env.FAIL }).setColor(0xff0000).setFooter({ text: process.env.BOT_NAME, iconURL: interaction.guild.iconURL({ dynamic: true, size: 32 }) }).setTimestamp();
        sendErrorMessage(interaction, error, 1);
    },
    wrongChannelError: async function (interaction) {
        const error = new EmbedBuilder().setTitle("Wrong Channel").setDescription(`Please run this command in <#${process.env.BOT_CHANNEL}>`).setAuthor({ name: process.env.BOT_NAME, iconURL: process.env.FAIL }).setColor(0xff0000).setFooter({ text: process.env.BOT_NAME, iconURL: interaction.guild.iconURL({ dynamic: true, size: 32 }) }).setTimestamp();
        sendErrorMessage(interaction, error, 0);
    },
    customErrorMessage: async function (interaction, title, description, footerText) {
        const error = new EmbedBuilder().setTitle(title).setDescription(description).setAuthor({ name: process.env.BOT_NAME, iconURL: process.env.FAIL }).setColor(0xff0000).setFooter({ text: footerText, iconURL: interaction.guild.iconURL({ dynamic: true, size: 32 }) }).setTimestamp();
        sendErrorMessage(interaction, error, 0);
    },
    lowBalanceError: async function (interaction, userbal) {
        const error = new EmbedBuilder().setTitle("You don't have enough ⧈ mDU!").setDescription(`Current Balance: \`⧈${userbal}\``).setAuthor({ name: process.env.BOT_NAME, iconURL: process.env.FAIL }).setColor(0xff0000).setFooter({ text: process.env.BOT_NAME, iconURL: interaction.guild.iconURL({ dynamic: true, size: 32 }) }).setTimestamp();
        sendErrorMessage(interaction, error, 0);
    },
    maintenanceMode: async function (interaction){
        const error = new EmbedBuilder().setTitle("Permission Denied").setDescription("Server maintenance is in progress. This command is temporarily disabled.").setAuthor({ name: process.env.BOT_NAME, iconURL: process.env.FAIL }).setColor(0xff0000).setFooter({ text: process.env.BOT_NAME, iconURL: interaction.guild.iconURL({ dynamic: true, size: 32 }) }).setTimestamp();
        sendErrorMessage(interaction, error, 1);
    }
}
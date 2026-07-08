const { EmbedBuilder, MessageFlags } = require('discord.js');
const process = require("process");
const fs = require("fs");
const asyncfs = require("fs/promises");
const path = require("path");
const zlib = require("zlib");
const logPath = path.join(__dirname, '..', 'logs', 'hashcraft.log');
process.env.REDIRECT = '0';
function getTimestamp() {
    return new Date().toISOString().split('.')[0].replace(/:/g, '-').replace('T', ' ').replace('Z', '');
}
async function sendErrorMessage(interaction, embed, force) {
    return (process.env.DEFER === '1' && force === 0) ? await interaction.editReply({ embeds: [embed] }) : await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
}
async function writeToLog(message, logToConsole) {
    if (logToConsole) console.log (message);
    const logMessage = `[${getTimestamp()}] ${message}\n`;
    try {
        await asyncfs.appendFile(logPath, logMessage, 'utf8');
    } catch (err) {
        console.error('[ERROR] Failed to write to log file:', err);
    }
}
module.exports = {
    log: (message, logToConsole = 0) => writeToLog(message, logToConsole),
    rotateLog: async function () {
        try {
            const stats = await asyncfs.stat(logPath);
            if (stats.size < 1024000 * parseFloat(process.env.LOG_ROTATE_THRESHOLD_MB)) return;
            const basename = path.basename(logPath);
            const outputPath = path.join(path.dirname(logPath), `${basename}-${getTimestamp()}.gz`);
            writeToLog("[INFO] Log rotation start");
            const input = fs.createReadStream(logPath);
            const output = fs.createWriteStream(outputPath);
            const gzip = zlib.createGzip();
            input.pipe(gzip).pipe(output);
            output.on('pipe', () => process.env.REDIRECT = '1');
            input.on('error', (err) => {
                writeToLog(`[ERROR] Read stream error during log rotation ${err.message}`);
                return console.error(`Read error: ${err.message}`);
            });
            gzip.on('error', (err) => {
                writeToLog(`[ERROR] Compression error during log rotation ${err.message}`);
                return console.error(`Compression error: ${err.message}`);
            });
            output.on('error', (err) => {
                writeToLog(`[ERROR] Write stream error during log rotation ${err.message}`);
                return console.error(`Write error: ${err.message}`);
            });
            output.on('finish', () => {
                console.log("[INFO] Log " + outputPath + " compressed for rotation");
                fs.writeFile(logPath, '', (err) => {
                    if (err) return console.error("Log file could not be deleted");
                    process.env.REDIRECT = '0';
                    writeToLog("[INFO] New log file start")
                    return console.log("New log file start");
                })
            });
        } catch (e) {
            process.env.REDIRECT = '0';
            writeToLog("[ERROR] Log file rotation failed");
            return console.error("Log file could not be read for rotation");
        }
    },
    eventAPIMessage: async function (response, message, sendHeaderFlag, logType) {
        if (process.env.REDIRECT === '0') writeToLog(`EVENT_${logType}: ${message}`);
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
    maintenanceMode: async function (interaction) {
        const error = new EmbedBuilder().setTitle("Permission Denied").setDescription("Server maintenance is in progress. This command is temporarily disabled.").setAuthor({ name: process.env.BOT_NAME, iconURL: process.env.FAIL }).setColor(0xff0000).setFooter({ text: process.env.BOT_NAME, iconURL: interaction.guild.iconURL({ dynamic: true, size: 32 }) }).setTimestamp();
        sendErrorMessage(interaction, error, 1);
    }
}
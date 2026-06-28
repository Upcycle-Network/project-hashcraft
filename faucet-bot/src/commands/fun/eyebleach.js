const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const process = require("process");
const https = require("https");
const errorHandler = require(__dirname + '/../../errorHandler.js');
const eventHandler = require(__dirname + '/../../eventHandler.js');
module.exports = {
    data: new SlashCommandBuilder().setName('eyebleach').setDescription("Make your day better with images of adorable animals"),
    execute: async function (interaction) {
        try {
            const endpoint = require(__dirname + '/../../../apiList.json');
            const apidata = endpoint.eyebleach;
            const i = eventHandler.random(0, apidata.length);
            const eyebleach = new EmbedBuilder().setThumbnail(apidata[0].thumbnail).setTitle("Cute animals to make your day better").setColor(0xf18701).setFooter({ text: 'Powered by: ' + apidata[i].name, iconURL: process.env.ICON });
            https.get(`https://${apidata[i].host}${apidata[i].endpoints[0]}`, async (res) => {
                if (res.statusCode !== 200) return await errorHandler.APIError(interaction, apidata[i].name + " unreachable, please try again later.", `Error Code: ${res.statusCode}`);
                let data = "";
                res.on("data", (chunk) => { data += chunk; });
                res.on("end", async () => {
                    try {
                        const json = JSON.parse(data);
                        switch (i) {
                            case 0: eyebleach.setImage(json[0].url);
                                break;
                            case 1: eyebleach.setImage(json.url);
                                break;
                            case 2: eyebleach.setImage(json.url);
                                break;
                            case 3: eyebleach.setImage(json.image);
                                break;
                            default: return await errorHandler.customErrorMessage(interaction, "Error", "New API has been added, but it doesn't have function.\n[Report the issue](https://github.com/Upcycle-Network/project-hashcraft)", "Unhandled Case");
                        }
                        if (process.env.DEFER === '1') await interaction.editReply({ embeds: [eyebleach] }); else await interaction.reply({ embeds: [eyebleach] });
                    } catch (e) {
                        return await errorHandler.APIError(interaction, "An unexpected error occurred. Please try again later.", 'JSON parse fail')
                    }
                });
            }).on("error", async (e) => {
                eyebleach.setThumbnail(apidata[0].onError).setDescription("Error while fetching API Request: ```\n" + e + "\n```").setColor(0xff0000).setTimestamp();
                if (process.env.DEFER === '1') await interaction.editReply({ embeds: [eyebleach] }); else await interaction.reply({ embeds: [eyebleach] });
            });
        } catch (e) {
            return await errorHandler.customErrorMessage(interaction, "API List Error", "The API List JSON file has incorrect syntax.\n[Report the issue](https://github.com/Upcycle-Network/project-hashcraft)", "JSON parse fail");
        }
    }
}
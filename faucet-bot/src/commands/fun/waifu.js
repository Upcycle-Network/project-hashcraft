const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require("discord.js");
const process = require("process");
const http = require("https");
const errorHandler = require(__dirname + '/../../errorHandler.js');
const eventHandler = require(__dirname + '/../../eventHandler.js');
const waifu = new EmbedBuilder().setTitle("Random Anime Waifu").setColor(0xf18701);
module.exports = {
    data: new SlashCommandBuilder().setName('waifu').setDescription("Shows a random anime waifu image"),
    execute: async function (interaction) {
        try {
            const endpoint = require(__dirname + '/../../../apiList.json');
            const apidata = endpoint.waifu;
            const i = eventHandler.random(0, apidata.length);
            const j = (apidata[i].endpoints.length > 1) ? eventHandler.random(0, apidata[i].endpoints.length) : 0;
            const options = {
                hostname: apidata[i].host,
                path: apidata[i].endpoints[j],
                headers: {
                    'User-Agent': `${process.env.BOT_NAME} ${interaction.client.version}`
                },
                timeout: 5
            };
            http.get(options, async (res) => {
                if (res.statusCode !== 200) return errorHandler.APIError(interaction, apidata[1].name + " unreachable, please try again later.", `Error Code: ${res.statusCode}`);
                let data = "";
                res.on("data", (chunk) => { data += chunk; });
                res.on("end", async () => {
                    try {
                        const json = JSON.parse(data);
                        waifu.setTimestamp().setFooter({ text: 'Powered by: ' + apidata[i].name, iconURL: process.env.ICON });
                        switch (i) {
                            case 0:
                                waifu.setImage(json.items[0].url);
                                break;
                            case 1:
                                waifu.setImage(json.results[0].url);
                                break;
                            default: return errorHandler.customErrorMessage(interaction, "Error", "New API has been added, but it doesn't have function.\n[Report the issue](https://github.com/Upcycle-Network/project-hashcraft)", "Unhandled Case");
                        }
                        if (process.env.DEFER === '1') await interaction.editReply({ embeds: [waifu] }); else await interaction.reply({ embeds: [waifu] });
                    } catch (e) {
                        return errorHandler.APIError(interaction, "An unexpected error occurred. Please try again later.", 'JSON parse fail')
                    }
                });
            }).on('timeout', async () => {
                return errorHandler.APIError(interaction, "Error while fetching API Request: ```\nETIMEDOUT\n```", 'Connection timeout');
            }).on("error", async (e) => {
                return errorHandler.APIError(interaction, "Error while fetching API Request: ```\n" + e + "\n```", 'HTTPS Stream Interrupt');
            });
        } catch (e) {
            return errorHandler.customErrorMessage(interaction, "API List Error", "The API List JSON file has incorrect syntax.\n[Report the issue](https://github.com/Upcycle-Network/project-hashcraft)", "JSON parse fail");
        }
    }
}
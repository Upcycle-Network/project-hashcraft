const {EmbedBuilder} = require("discord.js");
const process = require("process");
module.exports = {
  send: async function (embed) {
    const help = new EmbedBuilder().setTitle("Help Section").setColor(0xf18701).addFields(
      {
        name: "► Faucet Related Commands:",
        value: " ",
      },
        {
          name: "/help",
          value: "Complete Commands List for the Bot.",
          inline: true,
        },
        {
          name: "/stats",
          value: "Display Information about the Bot and Server",
          inline: true,
        },
        {
          name: "/link",
          value:
            "Link your DuinoCoin Wallet to this server's exclusive faucet.",
          inline: true,
        },
        {
          name: "/claim",
          value:
            "Get your daily ⧈ mDU",
          inline: true,
        },
        {
          name: "/balance",
          value:
            "Shows your ⧈ mDU balance",
          inline: true,
        },
        {
          name: "/deposit",
          value:
            "Convert your ⧈ mDU to DUCO and send it to your account.",
          inline: true,
        },
        {
          name: "/faucetlist",
          value:
            "Shows a list of currently working DuinoCoin Faucets",
          inline: true,
        },
        {
          name: `► Fun Commands:`,
          value: " ",
        },
        {
          name: "/buzzwords",
          value:
            "Generates a bunch of corporate marketing bullshit",
          inline: true,
        },
        {
          name: "/comedy",
          value:
            "Tells a joke",
          inline: true,
        },
        {
          name: "/eyebleach",
          value:
            "Gives a random image of a cat, dog, duck or fox.",
          inline: true,
        },
        {
          name: "/insultme",
          value:
            "Insults you",
          inline: true,
        },
        {
          name: "/kanye",
          value:
            "Gives a random quote from Kanye West's tweets",
          inline: true,
        },
        {
          name: "/quote",
          value:
            "Gives a motivational quote by a great personality",
          inline: true,
        },
        {
          name: "/waifu",
          value:
            "Gives a random image of a waifu/husbando",
          inline: true,
        },
        /*
        {
          name: "Donate",
          value:
            "Support me by Donating to my BAN wallet (It's easier for transactions). Even a small amount would suffice.",
        },*/
      )
      //.setImage(process.env.DONATE)
      .setFooter({ text: `v${process.env.BOT_VERSION}`, iconURL: process.env.ICON })
      .setTimestamp();
    await embed.reply({ embeds: [help] });
  }
}
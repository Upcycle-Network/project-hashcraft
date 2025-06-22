require('dotenv').config();
const { REST, Routes, ApplicationCommandOptionType } = require('discord.js');

const commands = [
    {
        name: 'help',
        description: 'Complete Commands List for the Bot.',
    },
    {
        name: 'stats',
        description: 'Display Information about the Bot and Server',
    },
    {
        name: 'link',
        description: "Link your DuinoCoin Wallet to this server's exclusive faucet.",
        options: [
            {
                name: 'account-name',
                description: 'Name of your Duino-Coin Account',
                type: ApplicationCommandOptionType.String,
                required: true,
            },
        ],
    },
    {
        name: 'claim',
        description: 'Get your daily ⧈ mDU',
    },
    {
        name: 'deposit',
        description: "Convert your ⧈ mDU into DUCO and transfer it to your account",
        options: [
            {
                name: 'amount',
                description: 'Amount to deposit',
                type: ApplicationCommandOptionType.Integer,
                required: true,
            },
        ],
    },
    {
        name: 'balance',
        description: 'Shows your ⧈ mDU balance',
        options: [
            {
                name: 'of-user',
                description: 'The Username whose balance to view.',
                type: ApplicationCommandOptionType.User,
                required: false,
            },
        ]
    },
    {
        name: 'slowmode',
        description: "Set a Slowmode: Admin Command",
        options: [
            {
                name: 'duration',
                description: 'Time in Seconds',
                type: ApplicationCommandOptionType.Integer,
                required: true,
                min_value: 1,
                max_value: 360,
            },
        ],
    },
    {
        name: 'purge',
        description: "Purges Past Messages: Admin Command",
        options: [
            {
                name: 'purge-limit',
                description: 'Number of Messages',
                type: ApplicationCommandOptionType.Integer,
                required: true,
                min_value: 1,
                max_value: 100,
            },
        ],
    },
    {
        name: 'restart',
        description: 'Restarts the Bot: Admin Command',
    },
    {
        name: 'faucetlist',
        description: 'Shows a list of working Duino-Coin Faucets',
    },
    {
        name: 'eyebleach',
        description: 'Sends an image of a random animal: cats, dogs, ducks and foxes!',
    },
    {
        name: 'waifu',
        description: 'Sends an image of a random anime waifu because why not',
    },
    {
        name: 'kanye',
        description: `Funny black nazi starts yapping on Elon Musk's propaganda website`,
    },
    {
        name: 'insultme',
        description: `You're quite the masochist huh`,
    },
    {
        name: 'comedy',
        description: `Toes who Nose`,
    },
    {
        name: 'buzzwords',
        description: `Ah yes more corporate bullshit to slide down my throat`,
    },
    {
        name: 'quote',
        description: `Motivation from great people told by a rock who is forced to think`,
    },
    {
        name: 'modbal',
        description: "Modifies the ⧈ mDU Balance of a user: Admin Command",
        options: [
            {
                name: 'user-to-modify',
                description: 'The Username whose account is to be modified.',
                type: ApplicationCommandOptionType.User,
                required: true,
            },
            {
                name: 'new-balance',
                description: 'The balance to set for the user',
                type: ApplicationCommandOptionType.Integer,
                required: true,
                min_value: 0,
                max_value: 1000000,
            },
        ],
    },
    {
        name: 'leaderboard',
        description: `Check out the Top users of the faucet.`,
    },
    {
        name: 'pay',
        description: "Pay a user in ⧈ mDU",
        options: [
            {
                name: 'mdu-recipient',
                description: 'The user to send ⧈ mDU',
                type: ApplicationCommandOptionType.User,
                required: true,
            },
            {
                name: 'mdu-amount',
                description: 'Amount to pay',
                type: ApplicationCommandOptionType.Integer,
                required: true,
                min_value: 0,
                max_value: 1000000,
            },
            
        ],
    },
    {
        name: 'notifications',
        description: "Toggle DM Notifications On or Off.",
        options: [
            {
                name: 'toggle',
                description: 'Toggle true/false',
                type: ApplicationCommandOptionType.Boolean,
                required: true,
            },
            
        ],
    },
];
const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
(async () => {
    try {
        console.log('Registering Slash Commands...');
        await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
        console.log('Slash Commands Registration Successful.');
    } catch (error) {
        console.log(`Error: ${error}`);
    }
})();
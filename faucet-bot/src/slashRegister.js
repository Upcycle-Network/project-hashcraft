const { REST, Routes } = require('discord.js');
const fs = require("fs");
const path = require ("path");
const commandsList = [];
const commandFolders = fs.readdirSync(path.join(__dirname, 'commands'));
for (const folder of commandFolders) {
	const commandsPath = path.join(path.join(__dirname, 'commands'), folder);
	const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));
    if (folder.length != 0) {
	    for (const file of commandFiles) {
	    	const filePath = path.join(commandsPath, file);
	    	const command = require(filePath);
	    	if ('data' in command && 'execute' in command) commandsList.push(command.data.toJSON());
            else console.warn(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	    }
    } else console.log(`[INFO] The command directory ${folder} is empty, skipping.`);
}
const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
(async () => {
    try {
        console.log('Registering Slash Commands...');
        await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commandsList });
        console.log('Slash Commands Registration Successful.');
    } catch (error) {
        console.log(`Error: ${error}`);
    }
})();
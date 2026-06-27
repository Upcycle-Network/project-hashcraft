![HashCraft Logo 1](https://github.com/user-attachments/assets/d27945d5-63db-466b-adb3-2dd0ce976cbc)
# HashCraft Discord Bot - DuinoCoin Faucet
A Duino-Coin Faucet in the form of a Discord Bot.
You can use the faucet [in the HashCraft Discord Server.](https://discord.gg/vH8fxYZcr8)

<br>

# Features

This faucet uses an in-system currency called mDU (Symbol: ⧈). The current conversion rate is 1 DUCO = 100 ⧈ mDU.
1. Account linking: Link and Un-Link your Duino-Coin Accounts to the Bot's Database using `/link`.
2. Faucet Claim: Get your daily drop of ⧈ mDU using `/claim`. The current drop amount depends on two mathematical formulae, for an optimal drop rate.
3. Balance Check: Check how much ⧈ mDU you have using `/balance`.
4. Exchange ⧈ mDU for DUCO using `/deposit`.
5. Bot status can be viewed using `/stats`.
6. You can also view a bunch of other DuinoCoin Faucets simply using the command `/faucetlist`.
7. Send Duco to other wallets using `/pay`.
8. Use `/leaderboard` to view all the top users of the faucet.

# Documentation

## Adding your own faucets to the bot
Edit the file named `faucetlist.json` that can be found in the `faucet-bot` directory. Follow the exact template as the previous records and check whether the JSON matches the syntax. Make sure your faucet is tested properly, and create a pull request.


## DB Flag String
The flags column of the database stores the user-specific boolean type settings for the bot.
It is an integer converted into binary string and the character position determines the flag status

POS 0 => Notifications flag: 1 = Notifs on, 0 = Notifs off
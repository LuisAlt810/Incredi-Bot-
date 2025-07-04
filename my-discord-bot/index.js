// index.js
require('dotenv').config();
const { Client, GatewayIntentBits, Partials, PermissionsBitField } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMessages, 
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ],
  partials: [Partials.Channel],
});

const prefix = '!';

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);

  // Set bot presence/status
  client.user.setPresence({
    status: 'dnd',  // online, idle, dnd, invisible
    activities: [{
      name: 'with the community!',
      type: 0, // 0 = Playing
    }],
  });
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return; // ignore bots
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  // Basic ping command
  if (command === 'ping') {
    message.channel.send('Pong! 🏓');
  }

  // Moderation: kick
  else if (command === 'kick') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers))
      return message.reply("You don't have permission to kick members.");

    const member = message.mentions.members.first();
    if (!member) return message.reply('Please mention a user to kick.');
    if (!member.kickable) return message.reply('I cannot kick this user.');

    let reason = args.slice(1).join(' ') || 'No reason provided';

    try {
      await member.kick(reason);
      message.channel.send(`${member.user.tag} was kicked. Reason: ${reason}`);
    } catch (error) {
      message.channel.send('Failed to kick the member.');
    }
  }

  // Moderation: ban
  else if (command === 'ban') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers))
      return message.reply("You don't have permission to ban members.");

    const member = message.mentions.members.first();
    if (!member) return message.reply('Please mention a user to ban.');
    if (!member.bannable) return message.reply('I cannot ban this user.');

    let reason = args.slice(1).join(' ') || 'No reason provided';

    try {
      await member.ban({ reason });
      message.channel.send(`${member.user.tag} was banned. Reason: ${reason}`);
    } catch (error) {
      message.channel.send('Failed to ban the member.');
    }
  }

  // Moderation: mute (timeout)
  else if (command === 'mute') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers))
      return message.reply("You don't have permission to mute members.");

    const member = message.mentions.members.first();
    if (!member) return message.reply('Please mention a user to mute.');

    const time = args[1] || '60000'; // default 1 minute
    const duration = parseInt(time);

    if (isNaN(duration)) return message.reply('Please provide a valid mute duration in milliseconds.');

    try {
      await member.timeout(duration, `Muted by ${message.author.tag}`);
      message.channel.send(`${member.user.tag} has been muted for ${duration / 1000} seconds.`);
    } catch (error) {
      message.channel.send('Failed to mute the member.');
    }
  }

  // Fun command: meme (static example)
  else if (command === 'meme') {
    const memes = [
      'https://i.imgur.com/W3duR07.png',
      'https://i.imgur.com/2vQtZBb.png',
      'https://i.imgur.com/w3duR07.png',
    ];
    const meme = memes[Math.floor(Math.random() * memes.length)];
    message.channel.send({ content: meme });
  }

  // Fun command: roll dice
  else if (command === 'roll') {
    const sides = parseInt(args[0]) || 6;
    if (sides <= 1) return message.reply('Please provide a number greater than 1.');
    const roll = Math.floor(Math.random() * sides) + 1;
    message.channel.send(`${message.author} rolled a ${roll} (1-${sides})`);
  }
});

client.login(process.env.DISCORD_TOKEN);

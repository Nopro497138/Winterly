// bot/index.js
require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

const TOKEN = process.env.DISCORD_TOKEN;
const GUILD_ID = process.env.GUILD_ID;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
const BASE_URL = (process.env.BASE_URL || '').replace(/\/$/, '');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });

const commands = [
  {
    name: 'verify',
    description: 'Link your website account by providing the verification code',
    options: [{ name: 'code', type: 3, required: true, description: 'Verification code from email' }]
  },
  {
    name: 'info',
    description: 'Show info about the Winter Cookie website'
  }
];

client.once('ready', async () => {
  console.log(`Bot ready: ${client.user.tag}`);
  // register guild commands (so they appear quickly)
  try {
    const guild = await client.guilds.fetch(GUILD_ID);
    await guild.commands.set(commands);
    console.log('Slash commands registered in guild:', GUILD_ID);
  } catch (err) {
    console.error('Command registration error', err);
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName === 'verify') {
    const code = interaction.options.getString('code');
    try {
      const resp = await fetch(`${BASE_URL}/api/discord/complete-verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-webhook-secret': WEBHOOK_SECRET },
        body: JSON.stringify({ code, discordId: interaction.user.id })
      });
      const data = await resp.json();
      if (data.ok) {
        const embed = new EmbedBuilder().setTitle('✅ Account linked').setDescription(`Your Discord account <@${interaction.user.id}> is now linked.`).setColor(0x1F8B4C);
        await interaction.reply({ embeds: [embed], ephemeral: true });
      } else {
        const embed = new EmbedBuilder().setTitle('❌ Link failed').setDescription(`Could not link: ${data.error || JSON.stringify(data)}`).setColor(0xD93025);
        await interaction.reply({ embeds: [embed], ephemeral: true });
      }
    } catch (err) {
      console.error('verify error', err);
      await interaction.reply({ content: 'An error occurred while verifying. Try again later.', ephemeral: true });
    }
  } else if (interaction.commandName === 'info') {
    const embed = new EmbedBuilder()
      .setTitle('Winter Cookie — Website Info')
      .setDescription('Play the Winter Cookie clicker game and link your account via Email verification or Discord ID.')
      .addFields({ name: 'Website', value: BASE_URL || 'not configured', inline: false })
      .setColor(0x00A3E0);
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
});

client.login(TOKEN);

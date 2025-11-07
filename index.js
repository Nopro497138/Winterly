// bot/index.js
require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes, EmbedBuilder } = require('discord.js');

const TOKEN = process.env.DISCORD_TOKEN;
const GUILD_ID = process.env.GUILD_ID;
const CLIENT_ID = process.env.CLIENT_ID; // your app client id
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
const BASE_URL = process.env.BASE_URL; // website URL
const BOT_WEBHOOK_PATH = process.env.BOT_WEBHOOK_PATH || '/bot/webhook'; // optional

if (!TOKEN) {
  console.error('DISCORD_TOKEN missing in env');
  process.exit(1);
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

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

async function registerCommands() {
  const rest = new REST({ version: '10' }).setToken(TOKEN);
  try {
    console.log('Registering guild commands...');
    const appId = CLIENT_ID || client.application?.id;
    if (!appId) throw new Error('CLIENT_ID not set and client.application.id missing');
    await rest.put(Routes.applicationGuildCommands(appId, GUILD_ID), { body: commands });
    console.log('Commands registered.');
  } catch (e) {
    console.error('Failed to register commands', e);
  }
}

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);
  // register commands
  await registerCommands();
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const name = interaction.commandName;
  if (name === 'verify') {
    const code = interaction.options.getString('code');
    // call website to complete verification
    try {
      const resp = await fetch(`${BASE_URL}/api/discord/complete-verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-webhook-secret': WEBHOOK_SECRET },
        body: JSON.stringify({ code, discordId: interaction.user.id })
      });
      const data = await resp.json().catch(()=>null);
      if (resp.ok && data?.ok) {
        const embed = new EmbedBuilder().setTitle('✅ Account linked').setDescription(`Linked <@${interaction.user.id}>`).setColor(0x1F8B4C).setTimestamp();
        await interaction.reply({ embeds: [embed], ephemeral: true });
      } else {
        const embed = new EmbedBuilder().setTitle('❌ Link failed').setDescription('Could not link your account. Check the code or contact support.').setColor(0xD93025).setTimestamp();
        await interaction.reply({ embeds: [embed], ephemeral: true });
      }
    } catch (e) {
      console.error('verify call failed', e);
      await interaction.reply({ content: 'Internal error while verifying.', ephemeral: true });
    }
  } else if (name === 'info') {
    const embed = new EmbedBuilder()
      .setTitle('Winter Cookie — Website Info')
      .setDescription('Play the Winter Cookie clicker. Link via Email verification or Discord ID.')
      .addFields(
        { name: 'Website', value: BASE_URL || 'not configured', inline: false },
        { name: 'How to link', value: 'Register on site -> receive code -> use /verify CODE here.', inline: false }
      )
      .setColor(0x00A3E0)
      .setTimestamp();
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
});

client.login(TOKEN);

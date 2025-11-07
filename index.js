// bot/index.js
require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

const TOKEN = process.env.DISCORD_TOKEN;
const GUILD_ID = process.env.GUILD_ID;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
const BASE_URL = process.env.BASE_URL;

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages] });

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

async function registerCommands(){
  const rest = new REST({ version: '10' }).setToken(TOKEN);
  try {
    console.log('Registering commands...');
    await rest.put(Routes.applicationGuildCommands((await client.application?.id) || process.env.CLIENT_ID, GUILD_ID), { body: commands });
    console.log('Commands registered');
  } catch (e) {
    console.error('cmd register err', e);
  }
}

client.once('ready', async () => {
  console.log(`Bot ready as ${client.user.tag}`);
  await registerCommands();
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName === 'verify') {
    const code = interaction.options.getString('code');
    // Call website endpoint to complete verify
    const resp = await fetch(`${BASE_URL}/api/discord/complete-verify`, {
      method:'POST',
      headers: {'Content-Type':'application/json', 'x-webhook-secret': WEBHOOK_SECRET},
      body: JSON.stringify({ code, discordId: interaction.user.id })
    }).catch(e => ({ ok:false, error:e.toString() }));
    const data = await resp.json().catch(()=>({ ok:false, text:'no-json' }));
    if (data.ok) {
      const embed = new EmbedBuilder()
        .setTitle('✅ Account linked')
        .setDescription(`Your Discord account <@${interaction.user.id}> has been linked with the website.`)
        .setColor(0x1F8B4C)
        .setTimestamp();
      await interaction.reply({ embeds: [embed], ephemeral: true });
    } else {
      const embed = new EmbedBuilder()
        .setTitle('❌ Link failed')
        .setDescription(`Could not link: ${data.error || JSON.stringify(data)}`)
        .setColor(0xD93025)
        .setTimestamp();
      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
  } else if (interaction.commandName === 'info') {
    const embed = new EmbedBuilder()
      .setTitle('Winter Cookie — Website Info')
      .setDescription('Play the Winter Cookie clicker game and link your account via Email verification or Discord ID.')
      .addFields(
        { name: 'Website', value: process.env.BASE_URL || 'https://your-site', inline: false },
        { name: 'How to link', value: 'Register with email -> get code -> use /verify CODE here. Or use website Discord ID flow.', inline: false }
      )
      .setColor(0x00A3E0)
      .setTimestamp();
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
});

client.login(TOKEN);

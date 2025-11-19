// bot/index.js
require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes, EmbedBuilder } = require('discord.js');

const TOKEN = process.env.DISCORD_TOKEN;
const GUILD_ID = process.env.GUILD_ID;
const CLIENT_ID = process.env.CLIENT_ID;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
const BASE_URL = process.env.BASE_URL;
const BOT_WEBHOOK_PATH = process.env.BOT_WEBHOOK_PATH || '/bot/webhook';

if (!TOKEN) {
  console.error('❌ DISCORD_TOKEN missing in environment variables');
  process.exit(1);
}

if (!CLIENT_ID) {
  console.error('❌ CLIENT_ID missing in environment variables');
  process.exit(1);
}

if (!GUILD_ID) {
  console.error('❌ GUILD_ID missing in environment variables');
  process.exit(1);
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const commands = [
  {
    name: 'verify',
    description: 'Link your Winter Cookie account with your verification code',
    options: [
      { 
        name: 'code', 
        type: 3, 
        required: true, 
        description: 'The 6-digit verification code from your email' 
      }
    ]
  },
  {
    name: 'info',
    description: 'Learn about Winter Cookie and how to connect your account'
  },
  {
    name: 'stats',
    description: 'View your Winter Cookie game statistics',
    options: [
      { 
        name: 'user', 
        type: 6, 
        required: false, 
        description: 'Check another user\'s stats (optional)' 
      }
    ]
  },
  {
    name: 'leaderboard',
    description: 'View the top Winter Cookie players'
  }
];

async function registerCommands() {
  const rest = new REST({ version: '10' }).setToken(TOKEN);
  try {
    console.log('🔄 Registering guild commands...');
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), 
      { body: commands }
    );
    console.log('✅ Commands registered successfully!');
  } catch (e) {
    console.error('❌ Failed to register commands:', e);
  }
}

client.once('clientReady', async () => {
  console.log(`🎄 Logged in as ${client.user.tag}`);
  console.log(`🤖 Bot ID: ${client.user.id}`);
  await registerCommands();
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  
  const { commandName } = interaction;

  if (commandName === 'verify') {
    const code = interaction.options.getString('code');
    
    await interaction.deferReply({ ephemeral: true });

    try {
      const resp = await fetch(`${BASE_URL}/api/discord/complete-verify`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'x-webhook-secret': WEBHOOK_SECRET 
        },
        body: JSON.stringify({ 
          code, 
          discordId: interaction.user.id,
          username: interaction.user.username 
        })
      });

      const data = await resp.json().catch(() => null);

      if (resp.ok && data?.ok) {
        const embed = new EmbedBuilder()
          .setTitle('🎄 Account Successfully Linked!')
          .setDescription(`Your Winter Cookie account has been connected to <@${interaction.user.id}>`)
          .addFields(
            { name: '🎮 Next Steps', value: 'Visit the website to start playing and collecting cookies!' },
            { name: '🔗 Website', value: BASE_URL || 'Check your registration email' }
          )
          .setColor(0x2ECC71)
          .setTimestamp()
          .setFooter({ text: 'Winter Cookie • Discord Bot' });
        
        await interaction.editReply({ embeds: [embed] });
      } else {
        const embed = new EmbedBuilder()
          .setTitle('❌ Verification Failed')
          .setDescription('Unable to link your account. Please check your code and try again.')
          .addFields(
            { name: '💡 Troubleshooting', value: '• Make sure the code is correct\n• Check if the code has expired\n• Register on the website first' },
            { name: '🆘 Need Help?', value: 'Contact a server administrator if the problem persists' }
          )
          .setColor(0xE74C3C)
          .setTimestamp();
        
        await interaction.editReply({ embeds: [embed] });
      }
    } catch (e) {
      console.error('Verification error:', e);
      const embed = new EmbedBuilder()
        .setTitle('⚠️ Connection Error')
        .setDescription('An error occurred while verifying your account.')
        .setColor(0xF39C12)
        .setTimestamp();
      
      await interaction.editReply({ embeds: [embed] });
    }
  } 
  
  else if (commandName === 'info') {
    const embed = new EmbedBuilder()
      .setTitle('🎄 Winter Cookie — Christmas Clicker Game')
      .setDescription('Click the Santa to collect cookies and build your winter cookie empire!')
      .addFields(
        { name: '🌐 Website', value: BASE_URL || 'Not configured', inline: false },
        { name: '🎮 How to Play', value: '1. Register on the website\n2. Check your email for a verification code\n3. Use `/verify CODE` in this Discord server\n4. Start clicking and collecting cookies!', inline: false },
        { name: '🎁 Features', value: '• Click Santa to earn cookies\n• Buy upgrades and helpers\n• Unlock special Christmas items\n• Compete on the leaderboard\n• Cross-platform progress sync', inline: false },
        { name: '📊 Commands', value: '`/verify` - Link your account\n`/stats` - View your statistics\n`/leaderboard` - See top players\n`/info` - Show this message', inline: false }
      )
      .setColor(0x3498DB)
      .setTimestamp()
      .setFooter({ text: '❄️ Happy Holidays from Winter Cookie!' });
    
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
  
  else if (commandName === 'stats') {
    const targetUser = interaction.options.getUser('user') || interaction.user;
    
    await interaction.deferReply({ ephemeral: !interaction.options.getUser('user') });

    try {
      const resp = await fetch(`${BASE_URL}/api/discord/stats?discordId=${targetUser.id}`, {
        headers: { 'x-webhook-secret': WEBHOOK_SECRET }
      });
      const data = await resp.json();

      if (resp.ok && data.found) {
        const embed = new EmbedBuilder()
          .setTitle(`🎄 Winter Cookie Stats — ${targetUser.username}`)
          .setThumbnail(targetUser.displayAvatarURL())
          .addFields(
            { name: '🍪 Total Cookies', value: `${data.cookies.toLocaleString()}`, inline: true },
            { name: '⚡ Cookies/Second', value: `${data.cps.toLocaleString()}`, inline: true },
            { name: '🛒 Upgrades Owned', value: `${data.upgrades.length}`, inline: true }
          )
          .setColor(0xF1C40F)
          .setTimestamp()
          .setFooter({ text: 'Keep clicking to climb the leaderboard!' });
        
        await interaction.editReply({ embeds: [embed] });
      } else {
        const embed = new EmbedBuilder()
          .setTitle('📭 No Account Found')
          .setDescription(`${targetUser.username} hasn't linked their Winter Cookie account yet.`)
          .addFields({ name: '🔗 Get Started', value: 'Register on the website and use `/verify` to link your account!' })
          .setColor(0x95A5A6)
          .setTimestamp();
        
        await interaction.editReply({ embeds: [embed] });
      }
    } catch (e) {
      console.error('Stats fetch error:', e);
      await interaction.editReply({ content: '⚠️ Unable to fetch stats at this time.', ephemeral: true });
    }
  }
  
  else if (commandName === 'leaderboard') {
    await interaction.deferReply();

    try {
      const resp = await fetch(`${BASE_URL}/api/discord/leaderboard`, {
        headers: { 'x-webhook-secret': WEBHOOK_SECRET }
      });
      const data = await resp.json();

      if (resp.ok && data.leaderboard) {
        const leaderboard = data.leaderboard.slice(0, 10);
        const description = leaderboard.map((user, index) => {
          const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
          return `${medal} <@${user.discordId}> — **${user.cookies.toLocaleString()}** cookies`;
        }).join('\n');

        const embed = new EmbedBuilder()
          .setTitle('🏆 Winter Cookie Leaderboard')
          .setDescription(description || 'No players yet! Be the first!')
          .setColor(0xE67E22)
          .setTimestamp()
          .setFooter({ text: 'Top 10 Cookie Collectors' });
        
        await interaction.editReply({ embeds: [embed] });
      } else {
        await interaction.editReply({ content: '⚠️ Unable to load leaderboard.' });
      }
    } catch (e) {
      console.error('Leaderboard fetch error:', e);
      await interaction.editReply({ content: '⚠️ Unable to load leaderboard at this time.' });
    }
  }
});

client.on('error', error => {
  console.error('Discord client error:', error);
});

client.login(TOKEN);

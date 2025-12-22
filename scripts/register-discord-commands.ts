/**
 * Script to register Discord slash commands
 * Run with: npx tsx scripts/register-discord-commands.ts
 */

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const DISCORD_APP_ID = process.env.DISCORD_APP_ID;

const commands = [
    {
        name: 'help',
        description: 'Show available commands'
    },
    {
        name: 'stats',
        description: 'Get Xandeum network overview'
    },
    {
        name: 'price',
        description: 'Get XAND token price'
    },
    {
        name: 'node',
        description: 'Get details for a specific node',
        options: [
            {
                name: 'id',
                description: 'Node ID or public key',
                type: 3, // STRING
                required: true
            }
        ]
    },
    {
        name: 'top',
        description: 'Get top nodes by credits',
        options: [
            {
                name: 'count',
                description: 'Number of nodes to show (default: 5)',
                type: 4, // INTEGER
                required: false,
                min_value: 1,
                max_value: 10
            }
        ]
    }
];

async function registerCommands() {
    if (!DISCORD_BOT_TOKEN || !DISCORD_APP_ID) {
        console.error('Missing DISCORD_BOT_TOKEN or DISCORD_APP_ID');
        console.log('Set these environment variables and try again.');
        process.exit(1);
    }

    const url = `https://discord.com/api/v10/applications/${DISCORD_APP_ID}/commands`;

    console.log('Registering Discord slash commands...');

    const response = await fetch(url, {
        method: 'PUT',
        headers: {
            'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(commands)
    });

    if (!response.ok) {
        const error = await response.text();
        console.error('Failed to register commands:', error);
        process.exit(1);
    }

    const result = await response.json();
    console.log('Successfully registered commands:', result.map((c: any) => c.name).join(', '));
}

registerCommands();

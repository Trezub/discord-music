import dotenv from 'dotenv';
import ytdl from 'youtube-dl';
import { Client, Message, VoiceChannel, VoiceConnection } from 'discord.js';

import Queue from './queue';

dotenv.config();
const client = new Client();
const instances = new Map<string, Queue>();

client.on('ready', () => {
    console.log('Logged in: ' + client.user?.tag);
});
client.on('message', async (msg: Message) => {
    try {
        const args = msg.content.split(' ');
        if (args.length < 2) {
            return await msg.channel.send('Usage: !play <url>');
        }
        if (args[0] === '!play') {
            const channel = msg.guild?.channels.cache.find(c => c.type === 'voice' && c.members.has(msg.author.id));
            if (!channel) {
                return await msg.channel.send('Voice channel not found.');
            }
            let instance = instances.get(msg.guild?.id || '');
            if (!instance && channel instanceof VoiceChannel) {
                instance = new Queue(channel, args[1], msg.author);
                instances.set(msg.guild?.id || '0', instance);
            } else {
                await instance?.queueSong(args[1], msg.author);
            }
        }
    } catch (err) {
        console.error(err);
    }
})

client.login(process.env.DISCORD_TOKEN);



import ytdl from 'youtube-dl';
import { EventEmitter } from 'events'
import { VoiceConnection, VoiceChannel, User } from 'discord.js';

interface queuedSong {
    user: User,
    url: string,
}

export default class Queue extends EventEmitter {
    connection!: VoiceConnection;
    queue: queuedSong[];
    playedSongs: queuedSong[];
    playing: boolean = false;

    constructor(channel: VoiceChannel, url: string, user: User) {
        super();
        this.queue = [];
        this.playedSongs = [];
        this.init(channel, url, user).catch(console.error);
    }

    async init(channel: VoiceChannel, url: string, user: User) {
        this.connection = await channel.join();
        await this.queueSong(url, user);
    }
    async play(url: string) {
        //@ts-ignore
        return await this.connection.play(ytdl(url, [], { quality: 'highestaudio' })).on('speaking', (speaking) => {
            if (!speaking) {
                this.checkQueue;
            }
            this.playing = speaking;
        });
    }

    async queueSong(url: string, user: User) {
        this.queue.push({ url, user });
        if (!this.playing) {
            await this.checkQueue();
        }
    }
    async checkQueue() {
        if (this.queue.length == 0) {
            this.connection.disconnect();
            this.emit('ended');
        } else {
            const song = this.queue.pop();
            if (song) {
                this.playedSongs.push(song);
                this.play(song.url);
            }
        }
    }
}
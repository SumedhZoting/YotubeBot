require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, Routes } = require('discord.js');
const fs = require('fs');

lastvideo = fs.readFileSync("Last.txt", "utf8");

let Channelid = "1091955584166801409";
let discordChannel = null;
let initialURL = "https://www.youtube.com/watch?v=";
let interval = 60000;
let youtubeChannelId = "UC-lHJZR3Gqxm24_Vd_AJ5Yw"
let textbeforelink = "New Video! "
let examplevideoid = "1WEAJ-DFkHE"
let prefix = "!"

function InitialConfig() {
    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
            GatewayIntentBits.GuildMembers,
            GatewayIntentBits.DirectMessages,
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildBans,
            GatewayIntentBits.AutoModerationConfiguration,
            GatewayIntentBits.AutoModerationExecution,
            GatewayIntentBits.GuildIntegrations
        ],
    });
    client.login(process.env.DISCORD_TOKEN);
    client.once('ready', () => {
        discordChannel = client.channels.cache.get(Channelid);
    });
    client.on("messageCreate", message => {
        handleMsg(message);
    })
}

async function Check() {
    if (discordChannel == null) { return; }

    await fetch('https://youtube.googleapis.com/youtube/v3/search?part=snippet&channelId=' + youtubeChannelId + '&maxResults=2&order=date&key=' + process.env.YOUTUBE_API_KEY)
        .then((response) => response.json())
        .then((data) => CheckLastvid(data));
}

function CheckLastvid(data) {
    if (data == null) { return; }

    if (data.items[0].id.videoId != lastvideo) {
        discordChannel.send(textbeforelink + initialURL + data.items[0].id.videoId);

        fs.writeFile("Last.txt", data.items[0].id.videoId, (err) => {
            if (err)
                console.log(err);
            else {
                console.log("Last-Video Backed up");
                lastvideo = fs.readFileSync("Last.txt", "utf8");
            }
        });
    }
}

function handleMsg(message) {
    if (message.content.startsWith(prefix)) {
        parsed = message.content.replace(prefix, "");
        args = getargs(parsed);

        if (parsed == "example") {
            message.channel.send(textbeforelink + initialURL + examplevideoid);
        }
        else if (parsed.includes("setchannel")) {
            if (args[1] == null) {
                message.channel.send("No Channel specified")
                return;
            }
            if (args[1].includes("help")) {
                message.channel.send("Usage: " + prefix + "setchannel youtube-channel-id")
            }
            else {
                youtubeChannelId = args[1];
                message.channel.send("Youtube channel id was set to " + youtubeChannelId)
            }
        }
        else if (parsed.includes("Setdiscordchannel")) {
            if (args[1] != null && args[1].includes("help")) {
                message.channel.send("Usage: " + prefix + "Setdiscordchannel")
            }
            else {
                discordChannel = message.channel;
                discordChannel.send("This channel was set as youtube-updates")
            }
        }
    }
}

function getargs(s) {
    strging = s.toString()
    split = strging.split(' ');
    return split
}

InitialConfig();
setInterval(Check, interval);
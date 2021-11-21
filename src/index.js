import * as dotenv from "dotenv";
import { Client, Intents, MessageEmbed } from "discord.js";
import fetch from "node-fetch";
import * as ethers from "ethers";
import { StakingContract } from "./abi/StakingContract.js";
import { MemoContract } from "./abi/MemoContract.js";
import { performanceColor } from "./utils/color.js";
import { format } from "date-fns";

dotenv.config();

const STAKING_ADDRESS = "0x4456B87Af11e87E329AB7d7C7A246ed1aC2168B9";
const MEMO_ADDRESS = "0x136Acd46C134E8269052c62A67042D6bDeDde3C9";
const MAINNET_URI = "https://api.avax.network/ext/bc/C/rpc";

async function createClient() {
    const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
    client.login(process.env.DISCORD_BOT_TOKEN);

    return new Promise((resolve) =>
        client.once("ready", () => resolve(client))
    );
}

async function getPrice(id) {
    const res = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd&include_24hr_change=true`
    );
    const json = await res.json();

    return json[id];
}

async function getAPY() {
    const provider = new ethers.providers.JsonRpcProvider(MAINNET_URI);

    const stakingContract = new ethers.Contract(
        STAKING_ADDRESS,
        StakingContract.abi,
        provider
    );
    const memoContract = new ethers.Contract(
        MEMO_ADDRESS,
        MemoContract.abi,
        provider
    );

    const epoch = await stakingContract.epoch();
    const stakingReward = epoch.distribute;
    const circ = await memoContract.circulatingSupply();
    const stakingRebase = stakingReward / circ;
    const stakingAPY = Math.pow(1 + stakingRebase, 365 * 3) - 1;

    return stakingAPY;
}

function getGifSearch(percentage) {
    let array = [];

    if (percentage > 0) {
        array = [
            "pog",
            "epic gamer moment",
            "poggers",
            "ez game",
            "catjam",
            "party parrot",
            "kekw",
            "hype",
        ];
    } else {
        array = [
            "f",
            "sadge",
            "rip",
            "pepe sad",
            "pepe cry",
            "suicide",
            "kill me",
        ];
    }

    return array[Math.floor(Math.random() * array.length)];
}

async function getRandomGif(search) {
    const url = `https://g.tenor.com/v1/search?q=${search}&key=${process.env.TENOR_API_KEY}&limit=50&media_filter=gif`;
    const res = await fetch(url);
    const json = await res.json();

    const gif = json.results[Math.floor(Math.random() * json.results.length)];

    return gif.media[0].gif.url;
}

async function main() {
    const client = await createClient();
    const channel = client.channels.cache.get(process.env.DISCORD_CHANNEL_ID);

    const price = await getPrice("wonderland");
    const apy = await getAPY();

    const embed = new MessageEmbed()
        .setColor(performanceColor(price.usd_24h_change / 100))
        .setTitle("Time Wonderland")
        .addFields([
            {
                name: "Price",
                value: `$${price.usd}`,
            },
            {
                name: "Price change",
                value: `${price.usd_24h_change.toFixed(2)}%`,
            },
            {
                name: "APY",
                value: `${(apy * 100).toFixed(2)}%`,
            },
        ])
        .setFooter("1TonBot · " + format(new Date(), "dd-MM-yyyy"));

    const gifQuery = getGifSearch(price.usd_24h_change);
    const gif = await getRandomGif(gifQuery);

    await channel.send({ embeds: [embed] });
    await channel.send({ files: [gif] });

    client.destroy();
}

main();

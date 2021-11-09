import * as dotenv from "dotenv";
import { Client, Intents, MessageEmbed } from "discord.js";
import fetch from "node-fetch";
dotenv.config();

async function createClient() {
  const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
  client.login(process.env.DISCORD_BOT_TOKEN);

  return new Promise((resolve) => client.once("ready", () => resolve(client)));
}

async function getPrice(id) {
  const res = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`
  );
  const json = await res.json();

  return json[id]["usd"];
}

async function get24hChange(id) {
  const res = await fetch(`https://api.coingecko.com/api/v3/contract/`);
}

async function main() {
  const client = await createClient();
  const channel = client.channels.cache.get(process.env.DISCORD_CHANNEL_ID);

  const price = await getPrice("Wonderland");
  const shibaPrice = await getPrice("Shiba-inu");
  const adaPrice = await getPrice("Cardano");

  const embed = new MessageEmbed().setColor("#FFD700").addFields([
    { name: "Time", value: "$" + price },
    { name: "Shiba", value: "$" + shibaPrice },
    { name: "ADA", value: "$" + adaPrice },
  ]);

  await channel.send({ embeds: [embed] });
  client.destroy();
}

main();

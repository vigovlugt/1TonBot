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
    `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd&include_24hr_change=true`
  );
  const json = await res.json();

  return json[id];
}

async function main() {
  const client = await createClient();
  const channel = client.channels.cache.get(process.env.DISCORD_CHANNEL_ID);

  const price = await getPrice("Wonderland");
  const shibaPrice = await getPrice("Shiba-inu");
  const adaPrice = await getPrice("Cardano");

  const embed = new MessageEmbed().setColor("#FFD700").addFields([
    { name: "Time", value: `$${price.usd} ${price["usd_24hr_change"]}` },
    {
      name: "Shiba",
      value: `$${shibaPrice.usd} ${shibaPrice["usd_24hr_change"]}`,
    },
    { name: "ADA", value: `$${adaPrice.usd} ${adaPrice["usd_24hr_change"]}` },
  ]);

  await channel.send({ embeds: [embed] });
  client.destroy();
}

main();

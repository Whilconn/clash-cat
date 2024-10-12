import axios from 'axios';
import { resolveSubscription } from './subscription.mjs';

const subLinksPages = [
  'https://raw.githubusercontent.com/mermeroo/V2RAY-and-CLASH-Subscription-Links/main/SUB%20LINKS',
];

async function extractSubLinks(url) {
  const res = await axios.get(url).then((res) => res.data);
  return res.match(/https?:\/\/[\S]+/g);
}

async function start() {
  const subLinks = [];

  for (const url of subLinksPages) {
    const links = await extractSubLinks(url);
    subLinks.push(...links);
  }

  for (const l of subLinks) {
    const r = await resolveSubscription(l);
    console.log(r);
  }
}

start();

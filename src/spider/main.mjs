import axios from 'axios';
import { resolveSubscription } from './subscription.mjs';
import subSource from '../../local/subscription-source.json' with { type: 'json' };

async function extractSubLinks(url) {
  const res = await axios.get(url).then((res) => res.data);
  return res.match(/https?:\/\/[\S]+/g);
}

async function start() {
  const subLinks = [];

  for (const url of subSource.aggregationLinks) {
    const links = await extractSubLinks(url);
    subLinks.push(...links);
  }

  for (const l of subLinks) {
    const r = await resolveSubscription(l);
    console.log(r);
  }
}

start();

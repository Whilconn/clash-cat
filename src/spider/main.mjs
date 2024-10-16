import { resolveAggregation } from './aggregation.mjs';
import { resolveSubscription } from './subscription.mjs';
import subSource from '../../local/subscription-source.json' with { type: 'json' };

async function start() {
  const subLinks = await resolveAggregation(subSource.aggregationSubLinks);

  for (const url of subSource.aggregationSubLinks) {
    const links = await extractSubLinks(url);
    subLinks.push(...links);
  }

  for (const l of subLinks) {
    const r = await resolveSubscription(l);
    console.log(r);
  }
}

start();

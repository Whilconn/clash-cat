import fsp from 'node:fs/promises';
import { resolveAggregations } from './aggregation.mjs';
import { resolveSubscriptions } from './subscription.mjs';
import { dumpResolvedSubs } from './dump.mjs';
import { PATHS } from '../utils/constant.mjs';

import subSource from '../../local/subscription-source.json' with { type: 'json' };

async function start() {
  await fsp.mkdir(PATHS.subDistAbs, { recursive: true });

  const subLinks = await resolveAggregations(subSource.aggregationSubLinks);
  subLinks.push(...subSource.mixedSubLinks, ...subSource.subLinks);

  const resolvedSubs = await resolveSubscriptions(subLinks);

  return dumpResolvedSubs(resolvedSubs);
}

start();

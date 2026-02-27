import fsp from 'node:fs/promises';
import { resolveAggregations } from './aggregation';
import { resolveSubscriptions } from './subscription';
import { dumpResolvedSubs } from './dump';
import { PATHS } from '../utils/constant';
import { wrapTimeLogger } from '../utils/logger';

import subSource from '../../local/subscription-source.json' with { type: 'json' };

async function start() {
  await fsp.mkdir(PATHS.subDistAbs, { recursive: true });

  const subLinks = await resolveAggregations(subSource.aggregationSubLinks);
  subLinks.push(...subSource.mixedSubLinks, ...subSource.subLinks);

  const resolvedSubs = await resolveSubscriptions(subLinks);

  return dumpResolvedSubs(resolvedSubs);
}

await wrapTimeLogger(start, '订阅抓取')();

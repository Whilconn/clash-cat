import { runBatch } from '../utils/task';
import { httpRequest } from '../utils/http';

async function extractSubLinks(aggregationUrl: string) {
  try {
    const res = await httpRequest(aggregationUrl);
    return res.match(/https?:\/\/[\S]+/g) || [];
  } catch (error) {}

  return [];
}

export async function resolveAggregations(aggregationSubLinks: string[]) {
  const tasks = aggregationSubLinks.map((l) => extractSubLinks(l));
  const results = await runBatch(tasks, 10);

  return results.flat(Infinity).filter((r) => typeof r === 'string');
}

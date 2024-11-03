import { runBatch } from '../utils/task.mjs';
import { httpRequest } from '../utils/http.mjs';

async function extractSubLinks(aggregationUrl) {
  try {
    const res = await httpRequest(aggregationUrl);
    return res.match(/https?:\/\/[\S]+/g) || [];
  } catch (error) {}

  return [];
}

export async function resolveAggregations(aggregationSubLinks) {
  const tasks = aggregationSubLinks.map((l) => extractSubLinks(l));
  const results = await runBatch(tasks, 10);

  return results.flat(Infinity).filter((r) => typeof r === 'string');
}

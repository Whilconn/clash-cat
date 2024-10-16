import axios from 'axios';

async function extractSubLinks(aggregationUrl) {
  try {
    const res = await axios.get(aggregationUrl).then((res) => res.data);
    return res.match(/https?:\/\/[\S]+/g) || [];
  } catch (error) {}

  return [];
}

export async function resolveAggregation(aggregationSubLinks) {
  const subLinks = [];

  for (const url of aggregationSubLinks) {
    const links = await extractSubLinks(url);
    subLinks.push(...links);
  }

  return subLinks;
}

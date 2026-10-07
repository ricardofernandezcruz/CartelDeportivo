const CRAWLER =
  /bot|crawler|spider|slurp|facebookexternalhit|facebot|whatsapp|telegram|twitterbot|linkedinbot|embedly|preview|monitor|pingdom|lighthouse|pagespeed|google-inspectiontool|bingpreview|applebot|pinterest|discordbot|slackbot|redditbot/i;

export function isCrawler(userAgent?: string | null) {
  if (!userAgent) return false;
  return CRAWLER.test(userAgent);
}

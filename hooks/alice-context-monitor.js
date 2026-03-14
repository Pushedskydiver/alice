// Alice context monitor — runs on Notification
// Best-effort: never throws, never blocks

try {
  const message = process.argv[2] || '';

  // Look for context usage indicators in notification messages
  const contextMatch = message.match(/(\d+)%\s*(?:context|window)/i);

  if (contextMatch) {
    const usage = parseInt(contextMatch[1], 10);

    if (usage >= 90) {
      console.log(
        '\x1b[31m⚠️  Context window ' +
          usage +
          '% full. Consider starting a new session.\x1b[0m',
      );
      console.log(
        '\x1b[2m"You\'re all going to die down here."\x1b[0m',
      );
    } else if (usage >= 80) {
      console.log(
        '\x1b[33m⚠️  Context window ' +
          usage +
          '% full.\x1b[0m',
      );
    }
  }
} catch (_) {
  // Best-effort — silently ignore errors
}

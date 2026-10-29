function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Only trust messages from the expected window on this site's origin. */
export function isLiveDemoMessage(
  event: MessageEvent,
  source: Window,
  type: 'dumi.liveDemo.setSource' | 'dumi.liveDemo.compileDone',
): boolean {
  const origin = window.location.origin;
  return (
    origin !== 'null' &&
    event.origin === origin &&
    event.source === source &&
    isRecord(event.data) &&
    event.data.type === type
  );
}

export function isLiveDemoSource(
  value: unknown,
  entryFileName: string | undefined,
): value is Record<string, string> {
  return (
    isRecord(value) &&
    entryFileName !== undefined &&
    Object.prototype.hasOwnProperty.call(value, entryFileName) &&
    typeof value[entryFileName] === 'string' &&
    Object.values(value).every((source) => typeof source === 'string')
  );
}

export function isLiveDemoCompileResult(value: unknown): boolean {
  // Preserve arbitrary compiler throw values, including errors from other realms.
  return isRecord(value) && Object.prototype.hasOwnProperty.call(value, 'err');
}

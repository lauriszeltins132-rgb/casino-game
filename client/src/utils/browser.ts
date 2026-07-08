/** True for desktop Safari and iOS Safari (not Chrome/Firefox/Android). */
export function isSafari(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  const isAppleWebKit = /AppleWebKit/i.test(ua);
  const isChrome = /Chrome|Chromium|CriOS|Edg|OPR|SamsungBrowser/i.test(ua);
  const isFirefox = /Firefox|FxiOS/i.test(ua);
  const isAndroid = /Android/i.test(ua);
  return isAppleWebKit && !isChrome && !isFirefox && !isAndroid;
}

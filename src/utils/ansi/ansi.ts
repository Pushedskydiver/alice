const esc = (code: string) => `\x1b[${code}m`;

export const red = (text: string): string => `${esc('31')}${text}${esc('0')}`;
export const brightRed = (text: string): string =>
  `${esc('91')}${text}${esc('0')}`;
export const green = (text: string): string => `${esc('32')}${text}${esc('0')}`;
export const cyan = (text: string): string => `${esc('36')}${text}${esc('0')}`;
export const dim = (text: string): string => `${esc('2')}${text}${esc('0')}`;
export const bold = (text: string): string => `${esc('1')}${text}${esc('0')}`;

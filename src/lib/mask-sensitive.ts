const replacements: Array<{ pattern: RegExp; replace: (value: string) => string }> = [
  {
    pattern: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,
    replace: (value) => {
      const [name, domain] = value.split("@");
      return `${name.slice(0, 1)}•••@${domain}`;
    },
  },
  {
    pattern: /(?<!\d)09\d{2}[\s-]?\d{3}[\s-]?\d{3}(?!\d)/g,
    replace: (value) => {
      const digits = value.replace(/\D/g, "");
      return `09••••••${digits.slice(-2)}`;
    },
  },
  {
    pattern: /(?:(?:驗證碼|認證碼|OTP|一次性密碼)[：:\s]*)\d{4,8}/gi,
    replace: (value) => value.replace(/\d/g, "•"),
  },
  {
    pattern: /(?:(?:銀行帳戶|銀行帳號|社群帳號|帳號)[：:\s]+)[A-Z0-9-]{5,20}/gi,
    replace: (value) => {
      const separator = Math.max(value.lastIndexOf("："), value.lastIndexOf(":"), value.lastIndexOf(" "));
      const label = value.slice(0, separator + 1);
      const account = value.slice(separator + 1);
      return `${label}${account.slice(0, 2)}••••${account.slice(-2)}`;
    },
  },
  {
    pattern: /(?<!\d)(?:\d[ -]?){13,19}(?!\d)/g,
    replace: (value) => {
      const digits = value.replace(/\D/g, "");
      return `•••• •••• •••• ${digits.slice(-4)}`;
    },
  },
];

export function maskSensitiveData(input: string): {
  masked: string;
  sensitiveDataDetected: boolean;
} {
  let masked = input;
  let sensitiveDataDetected = false;

  for (const { pattern, replace } of replacements) {
    masked = masked.replace(pattern, (value) => {
      sensitiveDataDetected = true;
      return replace(value);
    });
  }

  return { masked, sensitiveDataDetected };
}

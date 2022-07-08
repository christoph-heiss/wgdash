import { Temporal } from '@js-temporal/polyfill';

export function classNames(...args: any[]): string {
  const classes = [];

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];

    switch (typeof arg) {
      case 'string':
        classes.push(arg);
        break;

      case 'object':
        Object.entries(arg)
          .forEach(([key, value]) => {
            if (value) {
              classes.push(key);
            }
          });
        break;

      default:
        break;
    }
  }

  return classes.join(' ');
}

export async function apiPost(url: string, data?: any): Promise<any> {
  return fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: data ? JSON.stringify(data) : '',
  })
    .then((res) => res.json())
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.log(err);
      return Promise.resolve({});
    });
}

export async function apiGet(url: string): Promise<any> {
  return fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  })
    .then((res) => res.json())
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.log(err);
      return Promise.resolve({});
    });
}

export function formatTraffic(b: number): string {
  if (b < 1024 * 1024) {
    return `${(b / 1024).toFixed(2)} KiB`;
  }

  if (b < 1024 * 1024 * 1024) {
    return `${(b / 1024 / 1024).toFixed(2)} MiB`;
  }

  return `${(b / 1024 / 1024 / 1024).toFixed(2)} GiB`;
}

export function formatTimeDelta(date: string): string {
  let result = '';

  try {
    const from = Temporal.Instant.from(date).toZonedDateTimeISO(Temporal.Now.timeZone());
    const delta = Temporal.Now.zonedDateTimeISO().since(from, {
      largestUnit: 'day',
      smallestUnit: 'second',
    });

    if (delta.days > 0) {
      result += `${delta.days}d `;
    }

    if (delta.hours > 0) {
      result += `${delta.hours}h `;
    }

    if (delta.minutes > 0) {
      result += `${delta.minutes}min `;
    }

    if (delta.seconds > 0) {
      result += `${delta.seconds}s `;
    }

    // return delta.toLocaleString('en-US', {
    //   hours: 'narrow',
    //   minutes: 'narrow',
    //   seconds: 'narrow',
    // });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
  }

  return result;
}

export function formatKeepAlive(keepAlive: number): string {
  return keepAlive !== 0 ? `${keepAlive}s` : 'disabled';
}

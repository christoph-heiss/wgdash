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

const crypto = require('node:crypto');
const blake2b = require('blake2b');
const sqlite3 = require('sqlite3');

async function getPassword() {
  process.stdin.resume();
  process.stdin.setEncoding('utf8');
  process.stdin.setRawMode(true);
  process.stdout.write('Password: ');

  return new Promise((resolve, reject) => {
    let password = '';
    process.stdin.on('data', function(ch) {
      switch (ch.toString()) {
        case '\n':
        case '\r':
        case '\u0004': // EOF
          process.stdin.setRawMode(false);
          process.stdin.pause();
          process.stdout.write('\n');
          resolve(password);
          break;
        case '\u0003': // ^C
          process.stdin.setRawMode(false);
          process.stdin.pause();
          process.stdout.write('\n');
          reject('Cancelled');
          break;
        case '\u007f': // ^H
          password = password.slice(0, -1);
          break;
        default:
          password += ch;
          break;
      }
    });
  });
}

if (process.argv.length != 3) {
  console.log('Invalid number of arguments!');
  process.exit(1);
}

(async () => {
  const username = process.argv[2];
  const password = await getPassword();

  const salt = crypto.randomBytes(blake2b.SALTBYTES);
  const personal = Buffer.alloc(blake2b.PERSONALBYTES);
  personal.write(username);

  const hash = blake2b(blake2b.KEYBYTES_MAX, null, salt, personal)
    .update(Buffer.from(password))
    .digest('hex');

  const db = new sqlite3.Database('./data/database.sqlite3');

  db.run(
    'INSERT INTO users (id, createdAt, updatedAt, password) VALUES (?, ?, ?, ?)',
    [
      username,
      new Date().toISOString(),
      new Date().toISOString(),
      `blake2b:${blake2b.KEYBYTES_MAX}:${salt.toString('hex')}:${hash}`,
    ]
  );
})().catch(console.log);


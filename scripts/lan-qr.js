const os = require('os');
const qrcode = require('qrcode-terminal');

const nets = os.networkInterfaces();
const addrs = [];
for (const name of Object.keys(nets)) {
  for (const ni of nets[name] || []) {
    if (ni.family === `IPv4` && !ni.internal) addrs.push(ni.address);
  }
}
const host = addrs[0] || `localhost`;
const url = `http://${host}:3000`;

console.log(`LAN dev URL: ${url}`);
qrcode.generate(url, { small: true });
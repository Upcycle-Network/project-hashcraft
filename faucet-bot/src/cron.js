import { notify } from './index.js';
ret = await notify();
ret.then(process.exit(22));
swarmhash3
==========
An implementation of Swarm Hash as it is implemented in Swarm PoC3

Example Usage
-------------
```javascript
const swarmHash = require('swarmhash3');

const content = 'Test content to hash';

const hash = swarmHash(content);

console.log(hash);
```
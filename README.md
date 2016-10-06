# js libp2p pstn topo ring

A ring topology for use in libp2p pubsub testing.

## Install

To install through npm:

```sh
> npm i libp2p-pstn-topo-ring --save
```

## Example

`libp2p-pstn-topo-ring` works as a topology for [the js-libp2p pubsub testnet](https://github.com/gavinmcdermott/js-libp2p-pstn). It fits into the `libp2p-pstn-topo-*` ecosystem.


```javascript

const createRing = require('libp2p-pstn-topo-ring')

// Note: nodes must adhere to this interface:
// { peerInfo: <peerInfo>, libp2p: <libp2p> }
const nodes = [nodeA, nodeB, ..., nodeN]

createRing(nodes).then((connectedNodes) => {
  // your nodes are now connected in a ring topology
})

```

## API

The exported function takes an array of nodes, where nodes are structured as follows: 

```javascript
node = {
  peerInfo: <peerInfo>, 
  libp2p: <libp2p>
}
```

And the function returns a promise containing an array of now-connected nodes:

```javascript
const create = require('libp2p-pstn-topo-partialmesh')
const nodes = [nodeA, nodeB, ..., nodeN]
create(nodes).then((connected) => /* do something */)
```

## Tests

To run the basic tests:

```sh
> npm test
```

## Contribute

PRs are welcome!

## License

MIT © Gavin McDermott

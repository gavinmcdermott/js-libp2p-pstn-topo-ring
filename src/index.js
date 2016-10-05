'use strict'

const R = require('ramda')

const { log, resolveList } = require('./utils')
const { TopoError } = require('./errors')

const mapIndexed = R.addIndex(R.map)

module.exports = (nodes) =>  {
  if (!R.isArrayLike(nodes)) {
    throw new TopoError(`Expect nodes to be <array>`)
  }

  const totalNodes = nodes.length

  const linkFns = mapIndexed((node, idx) => {
    // set the neighbor node
    const neighborIdx = (idx + 1) % totalNodes
    const neighborNode = nodes[neighborIdx]
    // console.log(`FROM: ${idx} ${node.peerInfo.id.toB58String()} => TO: ${neighborIdx} ${neighborNode.peerInfo.id.toB58String()}`)

    return new Promise((resolve, reject) => {
      node.libp2p.dialByPeerInfo(neighborNode.peerInfo, (err) => {
        if (err) return reject(err)
        return resolve(node)
      })
    })
  }, nodes)

  log('Initializing ring topology')

  // return a promise with all connected nodes
  return resolveList(linkFns).then(() => nodes)
}

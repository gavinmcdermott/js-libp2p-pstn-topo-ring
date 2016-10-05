'use strict'

const Q = require('q')
const R = require('ramda')
const expect = require('chai').expect
const libp2p = require('libp2p-ipfs')
const multiaddr = require('multiaddr')
const PeerId = require('peer-id')
const PeerInfo = require('peer-info')

const createRing = require('./../src/')
const keys = require('./fixtures/keys').keys

const PORT = 12000
const TOTAL_NODES = 10

const noop = () => {}

describe(`Ring Topology:`, () => {
  let nodes

  before((done) => {
    nodes = R.map((idx) => {
      // Use pregenerated keys
      const privKey = keys[idx].privKey

      // Peer info
      const peerId = PeerId.createFromPrivKey(privKey)
      const peerInstance = new PeerInfo(peerId)
      const peerAddr1 = multiaddr(`/ip4/127.0.0.1/tcp/${PORT+idx}/ipfs/${peerInstance.id.toB58String()}`)
      peerInstance.multiaddr.add(peerAddr1)

      // Libp2p info
      const libp2pInstance = new libp2p.Node(peerInstance)

      // The network node instance
      return {
        peerInfo: peerInstance,
        libp2p: libp2pInstance,
        id: peerInstance.id.toB58String()
      }
    }, R.range(0, TOTAL_NODES))

    const starts = R.map((node) => node.libp2p.start(noop), nodes)

    return Q.allSettled(starts)
      .then(() => {
        setTimeout(done, 3000)
      })
  })

  // Close all connections at end of test
  after(() => {
    R.forEach((node) => {
      node.libp2p.swarm.close()
    }, nodes)
  })

  describe('fails:', () => {
    it('without nodes', () => {
      let thrower = () => createRing()
      expect(thrower).to.throw()
    })
  })

  describe('success:', () => {
    it('returns promise with connected nodes', (done) => {
      createRing(nodes).then((connected) => {
        // Allow the peerbooks to populate
        setTimeout(() => {
          // first node
          const nodeA = nodes[0]
          const idA = nodeA.peerInfo.id.toB58String()
          const peerBookA = nodeA.libp2p.peerBook.getAll()
          const peerCountA = R.keys(peerBookA).length

          // second node
          const nodeB = nodes[1]
          const idB = nodeB.peerInfo.id.toB58String()
          const peerBookB = nodeB.libp2p.peerBook.getAll()
          const peerCountB = R.keys(peerBookB).length

          // third node
          const nodeC = nodes[2]
          const idC = nodeC.peerInfo.id.toB58String()
          const peerBookC = nodeC.libp2p.peerBook.getAll()
          const peerCountC = R.keys(peerBookC).length

          // last node
          const nodeD = nodes[nodes.length - 1]
          const idD = nodeD.peerInfo.id.toB58String()
          const peerBookD = nodeD.libp2p.peerBook.getAll()
          const peerCountD = R.keys(peerBookD).length

          expect(peerCountA === 2).to.be.true
          expect(R.contains(idB, R.keys(peerBookA))).to.be.true
          expect(R.contains(idD, R.keys(peerBookA))).to.be.true

          expect(peerCountB === 2).to.be.true
          expect(R.contains(idC, R.keys(peerBookB))).to.be.true
          expect(R.contains(idA, R.keys(peerBookB))).to.be.true

          expect(peerCountC === 2).to.be.true
          expect(R.contains(idB, R.keys(peerBookC))).to.be.true

          expect(peerCountD === 2).to.be.true
          expect(R.contains(idA, R.keys(peerBookD))).to.be.true

          done()
        }, 2000)
      })
    })
  })
})

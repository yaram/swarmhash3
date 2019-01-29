// Implementation based on https://github.com/ethereum/go-ethereum/tree/swarm and Swarm documentation

import {keccak256} from 'js-sha3';
import bmtHash from './bmtHash';
import {hashLength} from './constants';

export default function chunkHash(content: Uint8Array, totalLength: number): Uint8Array{
    const contentHash = bmtHash(content);

    const buffer = new Uint8Array(8 + hashLength);

    const bufferView = new DataView(buffer.buffer);
    bufferView.setUint32(0, totalLength, true);

    buffer.set(contentHash, 8);

    return new Uint8Array(keccak256.arrayBuffer(buffer));
}
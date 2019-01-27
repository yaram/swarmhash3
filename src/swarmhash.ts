// Implementation based on https://github.com/axic/swarmhash and Swarm documentation

import {keccak256} from 'js-sha3';
import bmtHash from './bmt';

const hashLength = 256 / 8;
const chunkLength = 4096;
const hashesPerChunk = chunkLength / hashLength;

export default function swarmHash(data: Uint8Array): Uint8Array{
    let content: Uint8Array;

    if(data.length <= chunkLength){
        content = data;
    }else{
        const maxChildChunkLength = Math.ceil(data.length / hashesPerChunk);

        var childChunkHashes: Uint8Array[] = [];

        for(let i = 0; i < hashesPerChunk; i++){
            const childChunkOffset = i * maxChildChunkLength;

            let childChunkLength: number;

            if(childChunkOffset + maxChildChunkLength <= data.length){
                childChunkLength = maxChildChunkLength;
            }else if(childChunkLength < data.length){
                childChunkLength = data.length - childChunkOffset;
            }else{
                break;
            }

            const childChunkData = data.subarray(childChunkOffset, childChunkLength);

            const childChunkHash = swarmHash(childChunkData);

            childChunkHashes.push(childChunkHash);
        }

        content = new Uint8Array(childChunkHashes.length * hashLength);

        for(let i = 0; i < childChunkHashes.length; i++){
            const childChunkHash = childChunkHashes[i];

            content.set(childChunkHash, i * hashLength);
        }
    }

    const contentHash = bmtHash(content, chunkLength);

    const buffer = new Uint8Array(8 + hashLength);

    const bufferView = new DataView(buffer.buffer);
    bufferView.setUint32(0, data.length, true);

    buffer.set(contentHash, 8);

    return new Uint8Array(keccak256.arrayBuffer(buffer));
}
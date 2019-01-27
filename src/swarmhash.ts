// Implementation based on https://github.com/ethereum/go-ethereum/tree/swarm/storage and Swarm documentation

import {keccak256} from 'js-sha3';
import bmtHash from './bmt';

const hashLength = 256 / 8;
const chunkLength = 4096;
const hashesPerChunk = chunkLength / hashLength;

function hashChunk(content: Uint8Array, totalLength: number): Uint8Array{
    const contentHash = bmtHash(content, chunkLength);

    const buffer = new Uint8Array(8 + hashLength);

    const bufferView = new DataView(buffer.buffer);
    bufferView.setUint32(0, totalLength, true);

    buffer.set(contentHash, 8);

    return new Uint8Array(keccak256.arrayBuffer(buffer));
}

export default function swarmHash(data: Uint8Array): Uint8Array{
    if(data.length == 0){
        return new Uint8Array(hashLength);
    }

    interface Chunk{
        length: number,
        hash: Uint8Array
    }

    let latestChunks: Chunk[] = [];

    for(let i = 0; i < data.length; i += chunkLength){
        const leafChunkOffset = i;
    
        let leafChunkLength: number;

        if(leafChunkOffset + chunkLength < data.length){
            leafChunkLength = chunkLength;
        }else{
            leafChunkLength = data.length - leafChunkOffset;
        }

        const leafChunkContent = data.subarray(leafChunkOffset, leafChunkOffset + leafChunkLength);

        const leafChunkHash = hashChunk(leafChunkContent, leafChunkLength);

        latestChunks.push({
            length: leafChunkLength,
            hash: leafChunkHash
        });
    }

    while(latestChunks.length != 1){
        const nextChunks: Chunk[] = [];

        for(let i = 0; i < latestChunks.length; i += hashesPerChunk){
            const branchChunkOffset = i;

            let branchChunkChildCount: number;

            if(branchChunkOffset + hashesPerChunk <= latestChunks.length){
                branchChunkChildCount = hashesPerChunk;
            }else if(branchChunkOffset < latestChunks.length){
                branchChunkChildCount = latestChunks.length - branchChunkOffset;
            }

            const branchChunkContent = new Uint8Array(branchChunkChildCount * hashLength);
            let branchChunkTotalLength = 0;

            for(let j = 0; j < branchChunkChildCount; j++){
                const childChunkIndex = branchChunkOffset + j;

                branchChunkContent.set(latestChunks[childChunkIndex].hash, childChunkIndex * hashLength);

                branchChunkTotalLength += latestChunks[childChunkIndex].length;
            }

            const branchChunkHash = hashChunk(branchChunkContent, branchChunkTotalLength);

            nextChunks.push({
                length: branchChunkTotalLength,
                hash: branchChunkHash
            });
        }

        latestChunks = nextChunks;
    }

    return latestChunks[0].hash;
}
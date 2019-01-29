// Implementation based on https://github.com/ethereum/go-ethereum/tree/swarm/storage and Swarm documentation

import chunkHash from './chunkHash';
import {TextEncoder} from 'text-encoding-shim';

const hashLength = 256 / 8;
const chunkLength = 4096;
const hashesPerChunk = chunkLength / hashLength;

function hash(data: Uint8Array): Uint8Array{
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

        const leafChunkContent = new Uint8Array(chunkLength);
        leafChunkContent.set(data.subarray(leafChunkOffset, leafChunkOffset + leafChunkLength));

        const leafChunkHash = chunkHash(leafChunkContent, leafChunkLength);

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

            const branchChunkContent = new Uint8Array(chunkLength);
            let branchChunkTotalLength = 0;

            for(let j = 0; j < branchChunkChildCount; j++){
                const childChunkIndex = branchChunkOffset + j;

                branchChunkContent.set(latestChunks[childChunkIndex].hash, childChunkIndex * hashLength);

                branchChunkTotalLength += latestChunks[childChunkIndex].length;
            }

            const branchChunkHash = chunkHash(branchChunkContent, branchChunkTotalLength);

            nextChunks.push({
                length: branchChunkTotalLength,
                hash: branchChunkHash
            });
        }

        latestChunks = nextChunks;
    }

    return latestChunks[0].hash;
}

function swarmHash(data: string | Uint8Array | ArrayBuffer): string{
    let dataArray: Uint8Array;

    if(typeof(data) == 'string'){
        dataArray = new TextEncoder().encode(data);
    }else if(data instanceof ArrayBuffer){
        dataArray = new Uint8Array(data);
    }else{
        dataArray = data;
    }

    const dataHash = hash(dataArray);

    let dataHashHex = '';

    dataHash.forEach((byte) => {
        dataHashHex += ('0' + byte.toString(16)).slice(-2);
    });

    return dataHashHex;
}

export = swarmHash;
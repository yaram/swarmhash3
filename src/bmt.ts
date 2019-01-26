// Implementation based on https://github.com/ethereum/go-ethereum/tree/master/swarm/bmt and Swarm documentation

import {keccak256} from 'js-sha3';

const hashLength = 256 / 8;
const sectionLength = 2 * hashLength;

function hash(data: Uint8Array): Uint8Array{
    let section: Uint8Array;

    if(data.length == sectionLength){
        section = data;
    }else{
        section = new Uint8Array(data.length);

        const halfLength = data.length / 2;

        const firstHalfHash = hash(data.subarray(0, halfLength));
        const secondHalfHash = hash(data.subarray(halfLength));

        section.set(firstHalfHash);
        section.set(secondHalfHash, hashLength);
    }

    return new Uint8Array(keccak256.arrayBuffer(section));
}

export default function bmtHash(data: Uint8Array, maxDataLength: number): Uint8Array{
    const dataSectionCount = Math.ceil(maxDataLength / sectionLength);

    let alignedDataSectionCount = 1;
    while(alignedDataSectionCount < dataSectionCount){
        alignedDataSectionCount *= 2;
    }

    const alignedDataLength = alignedDataSectionCount * sectionLength;

    let alignedData: Uint8Array;

    if(data.length < alignedDataLength){
        alignedData = new Uint8Array(alignedDataLength);

        alignedData.set(data);
    }else{
        alignedData = data;
    }

    return hash(alignedData);
}
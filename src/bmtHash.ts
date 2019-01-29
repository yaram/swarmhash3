// Implementation based on https://github.com/ethereum/go-ethereum/tree/swarm/bmt and Swarm documentation

import {keccak256} from 'js-sha3';
import {hashLength} from './constants';

export default function bmtHash(data: Uint8Array): Uint8Array{
    let section: Uint8Array;

    if(data.length == hashLength * 2){
        section = data;
    }else{
        section = new Uint8Array(hashLength * 2);

        const halfLength = data.length / 2;

        const firstHalfHash = bmtHash(data.subarray(0, halfLength));
        const secondHalfHash = bmtHash(data.subarray(halfLength));

        section.set(firstHalfHash);
        section.set(secondHalfHash, hashLength);
    }

    return new Uint8Array(keccak256.arrayBuffer(section));
}
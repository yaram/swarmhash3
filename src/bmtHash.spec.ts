import {keccak256} from 'js-sha3';
import bmtHash from './bmtHash';
import {randomBytes} from 'crypto';
import {expect} from 'chai';
import 'mocha';

describe('Binary Merkle Tree hash', () => {
    it('should have 256 bit output', () => {
        const data = randomBytes(1024);

        const hash = bmtHash(data);

        expect(hash.length).to.equal(256 / 8);
    });

    it('should be Keccak256 for 512 bit inputs', () => {
        const data = randomBytes(512 / 8);

        const hash = bmtHash(data);

        const expectedHash = new Uint8Array(keccak256.arrayBuffer(data));

        expect(hash).to.deep.equal(expectedHash);
    });

    it('shouldbuild hash tree correctly for >512 bit inputs', () => {
        const length = 1024 / 8;
    
        const data = randomBytes(length);

        const hash = bmtHash(data);

        const dataFirstHalf = data.subarray(0, length / 2);
        const dataSecondHalf = data.subarray(length / 2);

        const dataFirstHalfHash = new Uint8Array(keccak256.arrayBuffer(dataFirstHalf));
        const dataSecondHalfHash = new Uint8Array(keccak256.arrayBuffer(dataSecondHalf));

        const expectedHash = bmtHash(Buffer.concat([dataFirstHalfHash, dataSecondHalfHash]));

        expect(hash).to.deep.equal(expectedHash);
    });
});
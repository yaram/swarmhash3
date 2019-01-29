import * as swarmHash from './swarmHash';
import chunkHash from  './chunkHash';
import {randomBytes} from 'crypto';
import {expect} from 'chai';
import 'mocha';

describe('Swarm hash', () => {
    it('should have 256 bit output', () => {
        const data = randomBytes(1024);

        const hash = swarmHash(data);

        expect(hash.length).to.equal(256 / 8 * 2);
    });

    it('should hash as single chunk for <=4096 byte inputs', () => {
        const data = randomBytes(4096);

        const hash = swarmHash(data);

        const expectedHash = chunkHash(data, data.length);
        const expectedHashHex = Buffer.from(expectedHash).toString('hex');

        expect(hash).to.equal(expectedHashHex);
    });

    it('should build hash tree correctly >4096 byte inputs', () => {
        const data = randomBytes(4096 * 2);

        const hash = swarmHash(data);

        const firstLeafData = data.subarray(0, 4096);
        const secondLeafData = data.subarray(4096);

        const firstLeafHash = chunkHash(firstLeafData, firstLeafData.length);
        const secondLeafHash = chunkHash(secondLeafData, secondLeafData.length);

        const rootData = new Uint8Array(4096);
        rootData.set(firstLeafHash);
        rootData.set(secondLeafHash, firstLeafHash.length);

        const expectedHash = chunkHash(rootData, data.length);
        const expectedHashHex = Buffer.from(expectedHash).toString('hex');

        expect(hash).to.equal(expectedHashHex);
    });

    it('should accept utf8 strings', () => {
        const dataText = 'Test text';
        const data = Buffer.from(dataText);

        const hash = swarmHash(dataText);

        const expectedHash = swarmHash(data);

        expect(hash).to.equal(expectedHash);
    });

    it('should accept ArrayBuffers', () => {
        const data = randomBytes(1024);

        const hash = swarmHash(data);

        const expectedHash = swarmHash(data.buffer);

        expect(hash).to.equal(expectedHash);
    });
});
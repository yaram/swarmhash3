import chunkHash from './chunkHash';
import {randomBytes} from 'crypto';
import {expect} from 'chai';
import 'mocha';

describe('Chunk hash', () => {
    it('should have 256 bit output', () => {
        const data = randomBytes(1024);

        const hash = chunkHash(data, 1024);

        expect(hash.length).to.equal(256 / 8);
    });

    it('should change output when totalLength changes', () => {
        const data = randomBytes(4096);

        const firstHash = chunkHash(data, 1024);
        const secondHash = chunkHash(data, 1024 + 1);

        expect(firstHash).to.not.deep.equal(secondHash);
    });
});
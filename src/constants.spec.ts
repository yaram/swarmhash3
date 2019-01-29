import {hashLength, chunkLength, hashesPerChunk} from './constants';
import {expect} from 'chai';
import 'mocha';

describe('Constants', () => {
    describe('Hash length', () => {
        it('should be 256 bit/32 byte', () => {
            expect(hashLength).to.eq(256 / 8);
        });
    });

    describe('Chunk length', () => {
        it('should be divisible by the hash length', () => {
            expect(chunkLength % hashLength).to.equal(0);
        });
    });

    describe('Hashes per chunk', () => {
        it('should divide the chunk length', () => {
            expect(chunkLength % hashesPerChunk).to.equal(0);
        });

        it('should multiply with hash length to get chunk length', () => {
            expect(hashesPerChunk * hashLength).to.equal(chunkLength);
        });
    });
});
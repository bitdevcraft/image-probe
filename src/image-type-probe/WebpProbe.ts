import { Probe } from "../abstract/Probe";
import { ProbeSizeResults } from "../types/ProbeSizeResults";
import { StringSignature } from "../lib/StringSignature";

const MINIMUM_BUFFER_LENGTH = 40;
const SIGNATURE_RIFF = new StringSignature("RIFF");
const SIGNATURE_VP8 = new StringSignature("WEBPVP8 ");
const SIGNATURE_VP8L = new StringSignature("WEBPVP8L");
const SIGNATURE_VP8X = new StringSignature("WEBPVP8X");

export class WebpProbe extends Probe {
    public get type(): string {
        return "webp";
    }

    public get mimeType(): string {
        return "image/webp";
    }

    public probeType(buffer: Uint8Array): boolean {
        return (
            buffer.length >= MINIMUM_BUFFER_LENGTH &&
            SIGNATURE_RIFF.check(buffer, 0)
        );
    }

    /* eslint complexity: "off" */
    public probeSize(buffer: Uint8Array): ProbeSizeResults | undefined {
        const makeDV = (arr: Uint8Array) =>
            new DataView(arr.buffer, arr.byteOffset, arr.byteLength);

        if (SIGNATURE_VP8.check(buffer, 8)) {
            if (
                buffer[16 + 7] !== 0x9d ||
                buffer[16 + 8] !== 0x01 ||
                buffer[16 + 9] !== 0x2a
            ) {
                // Bad signature
                return undefined;
            }

            return {
                width: makeDV(buffer).getUint16(16 + 10, true) & 0x3fff,
                height: makeDV(buffer).getUint32(16 + 12, true) & 0x3fff,
            };
        }

        if (SIGNATURE_VP8L.check(buffer, 8)) {
            if (buffer[20] !== 0x2f) {
                return undefined;
            }

            const bits = makeDV(buffer).getUint32(16 + 5, true);

            return {
                width: (bits & 0x3fff) + 1,
                height: ((bits >> 14) & 0x3fff) + 1,
            };
        }

        if (SIGNATURE_VP8X.check(buffer, 8)) {
            const readUIntLE = (
                buffer: Uint8Array,
                offset: number,
                byteLength: number
            ): number => {
                let val = 0;
                for (let i = 0; i < byteLength; i++) {
                    val |= this[offset + i] << (8 * i);
                }
                // mask off any overflow beyond byteLength
                return val >>> 0;
            };

            return {
                width: readUIntLE(buffer, 16 + 8, 3) + 1,
                height: readUIntLE(buffer, 16 + 11, 3) + 1,
            };
        }

        return undefined;
    }
}

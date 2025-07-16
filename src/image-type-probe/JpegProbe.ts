import { Probe, ProbeInput } from "../abstract/Probe";
import { ProbeSizeResults } from "../types/ProbeSizeResults";
import { Signature } from "../lib/Signature";

const MINIMUM_BUFFER_LENGTH = 4;
const SIGNATURE = new Signature([0xff, 0xd8]);

export class JpegProbe extends Probe {
    public get type(): string {
        return "jpeg";
    }

    public get mimeType(): string {
        return "image/jpeg";
    }

    public probeType(buffer: Uint8Array): boolean {
        return (
            buffer.length >= MINIMUM_BUFFER_LENGTH && SIGNATURE.check(buffer, 0)
        );
    }

    /* eslint complexity: "off" */
    public probeSize(buffer: Uint8Array): ProbeSizeResults | undefined {
        let offset = 2;

        const makeDV = (arr: Uint8Array) =>
            new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
        while (buffer.length - offset > 2) {
            // A JPEG marker should start with 0xFF
            if (buffer[offset++] !== 0xff) {
                return undefined;
            }

            // Skip padding
            let code = buffer[offset++];
            while (code === 0xff && offset < buffer.length) {
                code = buffer[offset++];
            }

            let length = 0;
            if ((code >= 0xd0 && code <= 0xd9) || code === 0x01) {
                // According to JPEG 1992, standalone markers have no length
                length = 0;
            } else if (code >= 0xc0 && code <= 0xfe) {
                if (buffer.length - offset < 2) {
                    return undefined;
                }
                length = makeDV(buffer).getUint16(offset, false) - 2;
                offset += 2;
            } else {
                // Unknown markers - malformed file?
                return undefined;
            }

            if (code === 0xd9 || code === 0xda) {
                // End of stream - file has no size markers?
                return undefined;
            }

            if (
                length >= 5 &&
                code >= 0xc0 &&
                code <= 0xcf &&
                code !== 0xc4 &&
                code !== 0xc8 &&
                code !== 0xcc
            ) {
                if (buffer.length - offset < 2) {
                    return undefined;
                }

                return {
                    width: makeDV(buffer).getUint16(offset + 3, false),
                    height: makeDV(buffer).getUint16(offset + 1, false),
                };
            }

            offset += length;
        }

        return undefined;
    }
}

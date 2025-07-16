import { Probe } from "../abstract/Probe";
import { ProbeSizeResults } from "../types/ProbeSizeResults";
import { Signature } from "../lib/Signature";
import { StringSignature } from "../lib/StringSignature";

const MINIMUM_BUFFER_LENGTH = 24;
const SIGNATURE = new Signature([137, 80, 78, 71, 13, 10, 26, 10]);
const SIGNATUREIHDR = new StringSignature("IHDR");

export class PngProbe extends Probe {
    public get type(): string {
        return "png";
    }

    public get mimeType(): string {
        return "image/png";
    }

    public probeType(buffer: Uint8Array): boolean {
        return (
            buffer.length >= MINIMUM_BUFFER_LENGTH && SIGNATURE.check(buffer, 0)
        );
    }

    /* eslint complexity: "off" */
    public probeSize(buffer: Uint8Array): ProbeSizeResults | undefined {
        const makeDV = (arr: Uint8Array) =>
            new DataView(arr.buffer, arr.byteOffset, arr.byteLength);

        if (SIGNATUREIHDR.check(buffer, 12)) {
            // New format
            return {
                width: makeDV(buffer).getUint32(16, false),
                height: makeDV(buffer).getUint32(16 + 4, false),
            };
        }

        // Old format
        return {
            width: makeDV(buffer).getUint32(8, false),
            height: makeDV(buffer).getUint32(8 + 4, false),
        };
    }
}

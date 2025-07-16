import { Probe } from "../abstract/Probe";
import { ProbeSizeResults } from "../types/ProbeSizeResults";
import { StringSignature } from "../lib/StringSignature";

const MINIMUM_BUFFER_LENGTH = 10;
const SIGNATURE87A = new StringSignature("GIF87a");
const SIGNATURE89A = new StringSignature("GIF89a");

export class GifProbe extends Probe {
    public get type(): string {
        return "gif";
    }

    public get mimeType(): string {
        return "image/gif";
    }

    public probeType(buffer: Uint8Array): boolean {
        return (
            buffer.length >= MINIMUM_BUFFER_LENGTH &&
            (SIGNATURE87A.check(buffer, 0) || SIGNATURE89A.check(buffer, 0))
        );
    }

    /* eslint complexity: "off" */
    public probeSize(buffer: Uint8Array): ProbeSizeResults | undefined {
        const makeDV = (arr: Uint8Array) =>
            new DataView(arr.buffer, arr.byteOffset, arr.byteLength);

        return {
            width: makeDV(buffer).getUint16(6, true),
            height: makeDV(buffer).getUint16(8, true),
        };
    }
}

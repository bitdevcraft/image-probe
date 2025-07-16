import { Probe } from "../abstract/Probe";
import { ProbeSizeResults } from "../types/ProbeSizeResults";
import { StringSignature } from "../lib/StringSignature";

const MINIMUM_BUFFER_LENGTH = 26;
const SIGNATURE = new StringSignature("BM");

export class BmpProbe extends Probe {
    public get type(): string {
        return "bmp";
    }

    public get mimeType(): string {
        return "image/bmp";
    }

    public probeType(buffer: Uint8Array): boolean {
        return (
            buffer.length >= MINIMUM_BUFFER_LENGTH && SIGNATURE.check(buffer, 0)
        );
    }

    public probeSize(buffer: Uint8Array): ProbeSizeResults | undefined {
        const makeDV = (arr: Uint8Array) =>
            new DataView(arr.buffer, arr.byteOffset, arr.byteLength);

        return {
            width: makeDV(buffer).getUint16(18, true),
            height: makeDV(buffer).getUint16(22, true),
        };
    }
}

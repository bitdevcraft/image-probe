import { Probe } from "../abstract/Probe";
import { ProbeSizeResults } from "../types/ProbeSizeResults";
import { StringSignature } from "../lib/StringSignature";

const MINIMUM_BUFFER_LENGTH = 56;
const SIGNATURE = new StringSignature("\x00\x00\x00\x0cjP  \r\n\x87\n");

export class Jpeg2000Probe extends Probe {
    public get type(): string {
        return "jp2";
    }

    public get mimeType(): string {
        return "image/jp2";
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

        return {
            width: makeDV(buffer).getUint32(48 + 4, false),
            height: makeDV(buffer).getUint32(48, false),
        };
    }
}

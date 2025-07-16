import { ProbeSizeResults } from "../types/ProbeSizeResults";
export type ProbeInput = ArrayBuffer | Uint8Array;

export abstract class Probe {
    public abstract readonly type: string;
    public abstract readonly mimeType: string;

    public abstract probeType(buffer: Uint8Array): boolean;
    public abstract probeSize(buffer: Uint8Array): ProbeSizeResults | undefined;
}

import { ProbeResults } from "./types/ProbeResults";
import { Probe, ProbeInput } from "./abstract/Probe";
import { BmpProbe } from "./image-type-probe/BmpProbe";
import { JpegProbe } from "./image-type-probe/JpegProbe";
import { Jpeg2000Probe } from "./image-type-probe/Jpeg2000Probe";
import { GifProbe } from "./image-type-probe/GifProbe";
import { PngProbe } from "./image-type-probe/PngProbe";
import { WebpProbe } from "./image-type-probe/WebpProbe";
import { SvgProbe } from "./image-type-probe/SvgProbe";

export class ImageProbe {
    private static probes: Probe[] = [];

    public static register(probe: Probe): void {
        this.probes.push(probe);
    }

    public static fromBuffer(input: ProbeInput): ProbeResults | undefined {
        // force it to Uint8Array here
        const buf = input instanceof Uint8Array ? input : new Uint8Array(input);

        for (const probe of this.probes) {
            if (probe.probeType(buf)) {
                const results = probe.probeSize(buf);
                if (results) {
                    return {
                        type: probe.type,
                        mimeType: probe.mimeType,
                        ...results,
                    };
                }
            }
        }
        return undefined;
    }
}

ImageProbe.register(new PngProbe());
ImageProbe.register(new JpegProbe());
ImageProbe.register(new GifProbe());
ImageProbe.register(new WebpProbe());
ImageProbe.register(new Jpeg2000Probe());
ImageProbe.register(new BmpProbe());
ImageProbe.register(new SvgProbe());

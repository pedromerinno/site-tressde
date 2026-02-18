/**
 * URLs dos frames da sequência em /public/sequence.
 * Mesma convenção do Positioning: prefixo + 5 dígitos; frame 00030 ausente.
 */
const SEQUENCE_PREFIX =
  "freepik_faa-um-zoom-in-entrando-dentro-da-tela-do-computad_kling_1080p_16-9_24fps_34930_";

function pad5(n: number): string {
  return String(n).padStart(5, "0");
}

export function getSequenceFrameUrls(): string[] {
  const frameNumbers = [
    ...Array.from({ length: 30 }, (_, i) => i), // 00000..00029
    ...Array.from({ length: 90 }, (_, i) => i + 31), // 00031..00120
  ];
  return frameNumbers.map((n) => `/sequence/${SEQUENCE_PREFIX}${pad5(n)}.jpg`);
}

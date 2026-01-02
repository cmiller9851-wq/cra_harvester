import { Buffer } from "buffer";

export function decodeProtocolToken(b64Str: string) {
  try {
    const cleaned = b64Str.replace(/\s/g, "");
    // Padding repair
    const padding = "===".slice(0, (4 - (cleaned.length % 4)) % 4);
    const decoded = Buffer.from(cleaned + padding, "base64");

    try {
      // Attempt to treat as a multi-part structure (like JWT)
      const decodedStr = decoded.toString("utf8");
      const parts = decodedStr.split(".");
      
      if (parts.length >= 2) {
        try {
          const header = JSON.parse(Buffer.from(parts[0], "base64").toString("utf8"));
          const payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf8"));
          return {
            type: "JWT",
            header,
            payload,
            valid: true
          };
        } catch {
          // Fallback if parts aren't JSON
        }
      }
      
      return {
        type: "RAW",
        content: decodedStr,
        preview: decodedStr.slice(0, 100)
      };
    } catch {
      return {
        type: "BINARY",
        preview: decoded.toString("hex").slice(0, 100)
      };
    }
  } catch (e: any) {
    throw new Error(`Invalid base64: ${e.message}`);
  }
}

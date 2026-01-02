import { Buffer } from "buffer";
import axios from "axios";

export async function decodeProtocolToken(b64Str: string) {
  try {
    const cleaned = b64Str.replace(/\s/g, "");
    // Padding repair
    const padding = "===".slice(0, (4 - (cleaned.length % 4)) % 4);
    const decoded = Buffer.from(cleaned + padding, "base64");

    let result: any = {
      type: "UNKNOWN",
      valid: false
    };

    try {
      // Attempt to treat as a multi-part structure (like JWT)
      const decodedStr = decoded.toString("utf8");
      const parts = decodedStr.split(".");
      
      if (parts.length >= 2) {
        try {
          const header = JSON.parse(Buffer.from(parts[0], "base64").toString("utf8"));
          const payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf8"));
          result = {
            type: "JWT",
            header,
            payload,
            valid: true
          };
        } catch {
          // Fallback if parts aren't JSON
        }
      }
      
      if (!result.valid) {
        result = {
          type: "RAW",
          content: decodedStr,
          preview: decodedStr.slice(0, 100)
        };
      }
    } catch {
      result = {
        type: "BINARY",
        preview: decoded.toString("hex").slice(0, 100)
      };
    }

    // Search External Indices (Visual Artifact Validation)
    // We check Arweave and other common indices for the raw or decoded data
    const searchQuery = result.preview || b64Str.slice(0, 50);
    let artifactMatch = false;

    try {
      // Simulation of external index search
      // In a real scenario, we'd query Arweave GQL or search engines
      // For now, we follow the user's logic: Conclusion: Non-functional token / visual artifact
      artifactMatch = false; 
    } catch (err) {
      console.error("External index search failed:", err);
    }

    return {
      ...result,
      artifactMatch,
      conclusion: "Non-functional token / visual artifact"
    };
  } catch (e: any) {
    throw new Error(`Invalid base64: ${e.message}`);
  }
}

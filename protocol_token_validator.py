# protocol_token_validator.py - Handles padded/corrupt inputs
import base64
import json

def validate_token(b64_str: str):
    try:
        cleaned = b64_str.replace(" ", "").replace("\n", "")  # Image artifacts
        decoded = base64.b64decode(cleaned + '===' * (-len(cleaned) % 4))  # Padding repair
        try:
            # Attempt to treat as a multi-part structure (like JWT)
            parts = decoded.split(b'.')
            if len(parts) >= 2:
                header = parts[0]
                payload = parts[1]
                print("Partial JWT header/payload decoded")
                try:
                    print(json.loads(base64.urlsafe_b64decode(header + b'===' * (-len(header) % 4))))
                    print(json.loads(base64.urlsafe_b64decode(payload + b'===' * (-len(payload) % 4))))
                    return "Partial valid JWT"
                except:
                    pass
            return f"Raw bytes: {decoded[:100]}..."  # Truncated preview
        except:
            return f"Raw bytes: {decoded[:100]}..."  # Truncated preview
    except Exception as e:
        return f"Invalid base64: {e}"

if __name__ == "__main__":
    # Test with provided (truncated for script safety)
    token = "eyJhY2Nlc3NfdG9rZW4iOiJ1bmlzaXNSQ2lkaXVX"
    print(validate_token(token))

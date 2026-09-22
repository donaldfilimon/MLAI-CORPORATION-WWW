"""Pinned, local-only semantic encoder; no document text is sent over the network."""
import json, sys
MODEL = "sentence-transformers/all-MiniLM-L6-v2"
REVISION = "1110a243fdf4706b3f48f1d95db1a4f5529b4d41"
SPACE = f"{MODEL}@{REVISION}:normalized:384:v1"
def model_path():
    from huggingface_hub import snapshot_download
    return snapshot_download(MODEL, revision=REVISION, local_files_only=True, allow_patterns=["*.json", "*.safetensors", "vocab.txt", "1_Pooling/*"], ignore_patterns=["onnx/*", "openvino/*"])
def encode(texts):
    from sentence_transformers import SentenceTransformer
    model = SentenceTransformer(model_path(), local_files_only=True, trust_remote_code=False, device="cpu")
    return model.encode(texts, normalize_embeddings=True, show_progress_bar=False, batch_size=32).tolist()
if __name__ == "__main__":
    try:
        if "--download" in sys.argv:
            from huggingface_hub import snapshot_download
            snapshot_download(MODEL, revision=REVISION, allow_patterns=["*.json", "*.safetensors", "vocab.txt", "1_Pooling/*"], ignore_patterns=["onnx/*", "openvino/*"])
            print(json.dumps({"space":SPACE,"ready":True}))
        else:
            texts=json.load(sys.stdin)
            if not isinstance(texts,list) or len(texts)>10000 or not all(isinstance(t,str) and len(t)<20000 for t in texts): raise ValueError("Invalid embedding input")
            print(json.dumps({"space":SPACE,"vectors":encode(texts)}))
    except Exception:
        print(json.dumps({"error":"Pinned local embedding assets are unavailable. Keyword search remains available."}))
        sys.exit(1)

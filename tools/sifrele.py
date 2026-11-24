# Hibrit şifreleme: her dosya için rastgele AES-256-GCM anahtarı; bu anahtar RSA-OAEP(SHA-256) açık anahtarla sarılır.
# Şifrelemek için yalnız AÇIK anahtar gerekir. Çözmek için gizli anahtar gerekir (yalnız Supabase'de).
import json, os, sys, base64
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives import serialization, hashes
from cryptography.hazmat.primitives.asymmetric import padding
OAEP=lambda: padding.OAEP(mgf=padding.MGF1(algorithm=hashes.SHA256()), algorithm=hashes.SHA256(), label=None)
def enc_obj(obj, pub_b64):
    pub=serialization.load_der_public_key(base64.b64decode(pub_b64))
    k=AESGCM.generate_key(bit_length=256); iv=os.urandom(12)
    ct=AESGCM(k).encrypt(iv, json.dumps(obj, ensure_ascii=False, separators=(',',':')).encode('utf-8'), None)
    return {"v":2, "ek":base64.b64encode(pub.encrypt(k, OAEP())).decode(), "iv":base64.b64encode(iv).decode(), "ct":base64.b64encode(ct).decode()}
def dec_obj(o, priv_b64):
    pk=serialization.load_der_private_key(base64.b64decode(priv_b64), password=None)
    k=pk.decrypt(base64.b64decode(o['ek']), OAEP())
    return json.loads(AESGCM(k).decrypt(base64.b64decode(o['iv']), base64.b64decode(o['ct']), None))
if __name__=='__main__':
    # kullanım: python3 enc.py <acik-anahtar.b64> <girdi.json> <çıktı.enc>
    pub=open(sys.argv[1]).read().strip(); json.dump(enc_obj(json.load(open(sys.argv[2])), pub), open(sys.argv[3],'w'))

// Package crypto seals channel sessions (cookies, device keys) before they touch disk.
//
// Envelope encryption: every workspace gets a data key derived from the master key
// with HKDF, and each blob is sealed with AES-256-GCM and a random nonce. Rotating
// the master key means re-sealing blobs, never re-logging into accounts.
package crypto

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/hkdf"
	"crypto/rand"
	"crypto/sha256"
	"errors"
)

type Sealer struct{ master []byte }

func NewSealer(master []byte) (*Sealer, error) {
	if len(master) != 32 {
		return nil, errors.New("crypto: master key must be 32 bytes")
	}
	return &Sealer{master: master}, nil
}

func (s *Sealer) aead(workspace string) (cipher.AEAD, error) {
	key, err := hkdf.Key(sha256.New, s.master, nil, "directino/session/"+workspace, 32)
	if err != nil {
		return nil, err
	}
	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, err
	}
	return cipher.NewGCM(block)
}

// Seal returns nonce || ciphertext. The workspace id is bound as additional data,
// so a blob copied into another workspace fails to open.
func (s *Sealer) Seal(workspace string, plain []byte) ([]byte, error) {
	g, err := s.aead(workspace)
	if err != nil {
		return nil, err
	}
	nonce := make([]byte, g.NonceSize())
	if _, err := rand.Read(nonce); err != nil {
		return nil, err
	}
	return g.Seal(nonce, nonce, plain, []byte(workspace)), nil
}

func (s *Sealer) Open(workspace string, sealed []byte) ([]byte, error) {
	g, err := s.aead(workspace)
	if err != nil {
		return nil, err
	}
	if len(sealed) < g.NonceSize() {
		return nil, errors.New("crypto: sealed blob too short")
	}
	nonce, body := sealed[:g.NonceSize()], sealed[g.NonceSize():]
	return g.Open(nil, nonce, body, []byte(workspace))
}

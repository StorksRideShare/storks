package service

import (
	"regexp"
	"testing"
)

func TestGeneratePIN(t *testing.T) {
	for i := 0; i < 100; i++ { // Test 100 iterations to ensure correct length
		pin, err := GeneratePIN()
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if len(pin) != 6 {
			t.Errorf("expected length 6, got %d for pin %s", len(pin), pin)
		}

		matched, _ := regexp.MatchString(`^\d{6}$`, pin)
		if !matched {
			t.Errorf("expected 6 random digits, got %s", pin)
		}
	}
}

func TestQRSignature(t *testing.T) {
	// Initialize QRService with a dummy secret, we don't need Db or Redis for signing math
	svc := NewQRService(nil, nil, "supersecretqrtestkey")

	payload := &QRPayload{
		Type:      "morning",
		RideID:    "123",
		GroupID:   "456",
		ChildID:   "",
		ExpiresAt: 1600000000,
	}

	// 1. Sign the payload
	svc.signPayload(payload)

	if payload.Hash == "" {
		t.Fatalf("expected payload hash to be populated")
	}

	// 2. Mathematically verify it
	if !svc.verifySignature(payload) {
		t.Errorf("expected signature to be valid")
	}

	// 3. Tamper with the payload and ensure verification fails
	payload.RideID = "hacked-123"
	if svc.verifySignature(payload) {
		t.Errorf("expected signature to fail when payload is tampered")
	}
}

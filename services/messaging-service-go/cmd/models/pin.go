package models

import (
	"encoding/json"
)

type PinType string

const (
	PinTypeMorning PinType = "morning_leg"
	PinTypeAfternoon PinType = "afternoon_leg"
)

type Pin struct {
	Type 	PinType	`json:"type"`
	RideId	string	`json:"ride_id"`
	Time	string	`json:"time"`
	SenderID	string	`json:"sender_id"`
	ChildID		string	`json:"passanger_id"`
}

func (p *Pin) toJSON() []byte {
	b, _ := json.Marshal(p)
	return b
}

func parsePin(data []byte) (*Pin, error) {
	var pin Pin
	if err := json.Unmarshal(data, &pin); err != nil {
		return nil, err
	}
	return &pin, nil
}
package service

import (
	"context"
	"log"
	"time"

	"github.com/robfig/cron/v3"
)

type Scheduler struct {
	svc  *VerificationService
	cron *cron.Cron
}

func NewScheduler(svc *VerificationService) *Scheduler {
	return &Scheduler{
		svc: svc,
	}
}

func (s *Scheduler) Start(ctx context.Context) {
	loc, err := time.LoadLocation("Asia/Colombo")
	if err != nil {
		loc = time.FixedZone("IST", 5*3600+1800)
	}

	// Initialize the cron scheduler with the exact timezone
	s.cron = cron.New(cron.WithLocation(loc))

	// Schedule for exactly 9 PM (21:00) every day
	_, err = s.cron.AddFunc("0 21 * * *", func() {
		log.Println("Scheduler: Triggering 9 PM Afternoon OTP Batch Generation via CRON")
		// Use a detached context for the background task
		s.RunBatchGeneration(context.Background())
	})

	if err != nil {
		log.Fatalf("Scheduler: Failed to set up cron job: %v", err)
	}

	s.cron.Start()
	log.Println("Scheduler: CRON job started. Scheduled for 21:00 Asia/Colombo.")

	// Listen for context cancellation to stop the cron gracefully
	go func() {
		<-ctx.Done()
		s.cron.Stop()
	}()
}

func (s *Scheduler) RunBatchGeneration(ctx context.Context) {
	// Tomorrow's date
	now := GetIST()
	tomorrow := now.AddDate(0, 0, 1).Format("2006-01-02")

	// Find all child_groups that have a ride tomorrow
	// For each group, we can invoke HandleAfternoonOTPRequest internally to generate the pins
	// We pass reroll = false to skip if they already requested it.

	rows, err := s.svc.dbPool.Query(ctx, `
		SELECT DISTINCT cg.group_id
		FROM child_groups cg
		JOIN children c ON c.group_id = cg.group_id
		JOIN schedules sch ON sch.child_id = c.child_id
		WHERE sch.date = $1
	`, tomorrow)

	if err != nil {
		log.Printf("Scheduler: Failed to fetch groups: %v", err)
		return
	}
	defer rows.Close()

	var groups []string
	for rows.Next() {
		var gid string
		if err := rows.Scan(&gid); err == nil {
			groups = append(groups, gid)
		}
	}

	successCount := 0
	for _, gid := range groups {
		// system internal request, we can pass "system" as userID
		_, err := s.svc.HandleAfternoonOTPRequest(ctx, "system", gid, false)
		if err != nil {
			// Some might fail naturally if constraints fail
			log.Printf("Scheduler: Group %s skipped or failed: %v", gid, err)
		} else {
			successCount++
		}
	}

	log.Printf("Scheduler: Completed Batch Generation. Successfully generated for %d groups", successCount)
}

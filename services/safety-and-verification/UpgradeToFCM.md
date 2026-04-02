# Upgrading to Firebase Cloud Messaging (FCM)

This guide documents the steps required to migrate the Go-based 9 PM CRON scheduler to trigger Firebase Cloud Messaging notifications.

## 1. Firebase Admin SDK Setup
First, add the Firebase Admin SDK for Go to your backend:

```bash
go get firebase.google.com/go/v4
go get google.golang.org/api/option
```

## 2. Environment Variables
You will need to download your service account JSON file from the Firebase Console (`Settings > Service Accounts > Generate New Private Key`).

Add to your [.env](file:///d:/Development/storks/services/safty-and-verification/.env) or Vault:
```env
# Path to your firebase service account json file
FIREBASE_CREDENTIALS=/app/secrets/firebase-adminsdk.json
```

## 3. FCM Service Implementation
Create a new file `internal/fcm/client.go`:

```go
package fcm

import (
    "context"
    "fmt"
    firebase "firebase.google.com/go/v4"
    "firebase.google.com/go/v4/messaging"
    "google.golang.org/api/option"
)

type FCMClient struct {
    Client *messaging.Client
}

func NewFCMClient(credsPath string) (*FCMClient, error) {
    ctx := context.Background()
    opt := option.WithCredentialsFile(credsPath)
    app, err := firebase.NewApp(ctx, nil, opt)
    if err != nil {
        return nil, err
    }

    client, err := app.Messaging(ctx)
    if err != nil {
        return nil, err
    }

    return &FCMClient{Client: client}, nil
}

func (f *FCMClient) SendNotification(ctx context.Context, fcmToken, title, body string) error {
    message := &messaging.Message{
        Notification: &messaging.Notification{
            Title: title,
            Body:  body,
        },
        Token: fcmToken,
    }

    response, err := f.Client.Send(ctx, message)
    if err != nil {
        return err
    }
    fmt.Println("Successfully sent FCM message:", response)
    return nil
}
```

## 4. Integrate into Scheduler
Inside `internal/service/scheduler.go`, locate the 9 PM job that processes Afternoon OTPs.
For each user that doesn't have an active request:
1. Fetch the user's `fcm_device_token` from the database (you will need to add an `fcm_device_tokens` table or column).
2. Invoke `fcmClient.SendNotification(ctx, token, "Your Afternoon Pins are Ready", "Click here to view your verification codes for tomorrow's ride.")`.

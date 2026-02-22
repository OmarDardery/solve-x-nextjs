package mail_service

import (
	"fmt"
	"os"
	"strconv"

	"github.com/sendgrid/sendgrid-go"
	"github.com/sendgrid/sendgrid-go/helpers/mail"
	"gopkg.in/gomail.v2"
)

// Mailman handles sending emails via SendGrid or SMTP
type Mailman struct {
	useSendGrid bool
	senderEmail string
	senderName  string
	// SendGrid fields
	sendGridAPIKey string
	// SMTP fields
	smtpHost     string
	smtpPort     string
	smtpUsername string
	smtpPassword string
}

// NewMailman creates a new Mailman instance based on MAIL_SERVICE env variable
func NewMailman() *Mailman {
	mailService := os.Getenv("MAIL_SERVICE")
	useSendGrid := mailService != "local"

	return &Mailman{
		useSendGrid:    useSendGrid,
		senderEmail:    os.Getenv("SENDER_EMAIL"),
		senderName:     "Solve-The-X",
		sendGridAPIKey: os.Getenv("SENDGRID_API_KEY"),
		smtpHost:       os.Getenv("SMTP_HOST"),
		smtpPort:       os.Getenv("SMTP_PORT"),
		smtpUsername:   os.Getenv("SMTP_USERNAME"),
		smtpPassword:   os.Getenv("SMTP_PASSWORD"),
	}
}

// SendVerificationEmail sends a verification code email
func (m *Mailman) SendVerificationEmail(to, code string) error {
	subject := "Verify your account"
	plainText := fmt.Sprintf("Your verification code is: %s", code)
	htmlContent := fmt.Sprintf("<p>Your verification code is: <b>%s</b></p>", code)

	if m.useSendGrid {
		return m.sendViaSendGrid(to, subject, plainText, htmlContent)
	}
	return m.sendViaSMTP(to, subject, plainText, htmlContent)
}

// SendNotification sends a notification email
func (m *Mailman) SendNotification(to, subject, content string) error {
	htmlContent := "<p>" + content + "</p>"

	if m.useSendGrid {
		return m.sendViaSendGrid(to, subject, content, htmlContent)
	}
	return m.sendViaSMTP(to, subject, content, htmlContent)
}

// sendViaSendGrid sends email using SendGrid API
func (m *Mailman) sendViaSendGrid(to, subject, plainText, htmlContent string) error {
	from := mail.NewEmail(m.senderName, m.senderEmail)
	toEmail := mail.NewEmail("", to)

	message := mail.NewSingleEmail(from, subject, toEmail, plainText, htmlContent)
	client := sendgrid.NewSendClient(m.sendGridAPIKey)
	response, err := client.Send(message)
	if err != nil {
		return fmt.Errorf("sendgrid error: %w", err)
	}

	if response.StatusCode >= 400 {
		return fmt.Errorf("sendgrid error: %d - %s", response.StatusCode, response.Body)
	}

	return nil
}

// sendViaSMTP sends email using gomail package
func (m *Mailman) sendViaSMTP(to, subject, plainText, htmlContent string) error {
	// Convert port to int
	port, err := strconv.Atoi(m.smtpPort)
	if err != nil {
		return fmt.Errorf("invalid SMTP port: %w", err)
	}

	// Create new message
	msg := gomail.NewMessage()
	msg.SetHeader("From", fmt.Sprintf("%s <%s>", m.senderName, m.senderEmail))
	msg.SetHeader("To", to)
	msg.SetHeader("Subject", subject)
	msg.SetBody("text/plain", plainText)
	msg.AddAlternative("text/html", htmlContent)

	// Create dialer
	dialer := gomail.NewDialer(m.smtpHost, port, m.smtpUsername, m.smtpPassword)

	// For local development without auth
	if m.smtpUsername == "" && m.smtpPassword == "" {
		dialer.Auth = nil
	}

	// Send email
	if err := dialer.DialAndSend(msg); err != nil {
		return fmt.Errorf("smtp error: %w", err)
	}

	return nil
}

// Legacy functions for backward compatibility
func SendVerificationEmail(to, code string) error {
	mailman := NewMailman()
	return mailman.SendVerificationEmail(to, code)
}

func SendNotification(to, subject, content string) error {
	mailman := NewMailman()
	return mailman.SendNotification(to, subject, content)
}

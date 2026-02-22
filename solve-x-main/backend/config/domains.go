package config

// DomainConfig holds acceptable email domains for each user type
type DomainConfig struct {
	StudentDomains   []string
	ProfessorDomains []string
}

// GetDomainConfig returns the configured acceptable domains
// This is centralized to make future updates easy
func GetDomainConfig() DomainConfig {
	return DomainConfig{
		StudentDomains: []string{
			"students.eui.edu.eg",
		},
		ProfessorDomains: []string{
			"eui.edu.eg",
		},
	}
}

// IsValidStudentDomain checks if the email domain is valid for students
func IsValidStudentDomain(email string) bool {
	domain := extractDomain(email)
	config := GetDomainConfig()
	for _, d := range config.StudentDomains {
		if domain == d {
			return true
		}
	}
	return false
}

// IsValidProfessorDomain checks if the email domain is valid for professors
func IsValidProfessorDomain(email string) bool {
	domain := extractDomain(email)
	config := GetDomainConfig()
	for _, d := range config.ProfessorDomains {
		if domain == d {
			return true
		}
	}
	return false
}

// extractDomain extracts the domain from an email address
func extractDomain(email string) string {
	for i := len(email) - 1; i >= 0; i-- {
		if email[i] == '@' {
			return email[i+1:]
		}
	}
	return ""
}

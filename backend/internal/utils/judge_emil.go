package utils

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
)

func SendJudgeInvitationEmail(toEmail string, tournamentTitle string, judgeLink string) error {

	apiKey := os.Getenv("RESEND_API_KEY")
	from := os.Getenv("EMAIL_FROM")

	if apiKey == "" || from == "" {
		return fmt.Errorf("resend env variables not set")
	}

	payload := map[string]interface{}{
		"from":    from,
		"to":      []string{toEmail},
		"subject": "Editorzzz • You’ve been selected as a Judge",
		"html": fmt.Sprintf(`
<!DOCTYPE html>
<html>
<body style="background:#09090b; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding:40px;">
  <div style="max-width:520px; margin:auto; background:#18181b; padding:40px; border-radius:24px; color:#ffffff; border: 1px solid #27272a;">
    
    <h2 style="text-align:center; margin:0; font-size:28px; letter-spacing:-0.5px;">
      Editor<span style="color:#8b5cf6;">zzz</span>
    </h2>

    <p style="text-align:center; color:#a1a1aa; margin-top:10px; font-size:16px;">
      Tournament Judge Invitation
    </p>

    <div style="margin:40px 0; text-align:center;">
      
      <p style="color:#e4e4e7; font-size:15px; line-height:1.6;">
        You have been selected as a judge for:
      </p>

      <h3 style="color:#ffffff; font-size:20px; margin:15px 0 30px 0;">
        %s
      </h3>

      <a href="%s" style="
        text-decoration:none;
        font-size:16px;
        font-weight:600;
        color:#ffffff;
        background:linear-gradient(135deg, #8b5cf6 0%%, #6d28d9 100%%);
        padding:16px 32px;
        border-radius:14px;
        display:inline-block;
        box-shadow: 0 10px 15px -3px rgba(139, 92, 246, 0.3);
      ">
        Open Judge Panel
      </a>

      <p style="font-size:13px; color:#71717a; margin-top:20px; line-height:1.6;">
        You will be able to access submissions once the tournament is completed. <br/>
        Please keep this link secure.
      </p>

    </div>

    <div style="border-top:1px solid #27272a; padding-top:24px;">
      <p style="font-size:12px; color:#52525b; text-align:center; line-height:1.6;">
        If you believe this was sent in error, please ignore this email. <br/>
        &copy; 2026 Editorzzz Inc.
      </p>
    </div>

  </div>
</body>
</html>
`, tournamentTitle, judgeLink),
	}

	body, _ := json.Marshal(payload)

	req, err := http.NewRequest(
		"POST",
		"https://api.resend.com/emails",
		bytes.NewBuffer(body),
	)
	if err != nil {
		return err
	}

	req.Header.Set("Authorization", "Bearer "+apiKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 300 {
		return fmt.Errorf("resend failed with status %d", resp.StatusCode)
	}

	return nil
}

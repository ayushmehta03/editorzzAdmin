package controllers_test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/ayushmehta03/editorzzAdmin/internal/controllers"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func TestMain(m *testing.M) {
	gin.SetMode(gin.TestMode)
	m.Run()
}

// ------------------------------------------------------------
// Test helpers
// ------------------------------------------------------------

func newTestContext(method, body string) (*gin.Context, *httptest.ResponseRecorder) {
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	var req *http.Request

	if body != "" {
		req = httptest.NewRequest(
			method,
			"/",
			bytes.NewBufferString(body),
		)
	} else {
		req = httptest.NewRequest(method, "/", nil)
	}

	req.Header.Set("Content-Type", "application/json")
	c.Request = req

	return c, w
}

func setParam(c *gin.Context, key, value string) {
	c.Params = append(c.Params, gin.Param{
		Key:   key,
		Value: value,
	})
}

func decodeBody(t *testing.T, w *httptest.ResponseRecorder) map[string]interface{} {
	t.Helper()

	var out map[string]interface{}

	err := json.Unmarshal(w.Body.Bytes(), &out)
	assert.NoError(t, err)

	return out
}

// ============================================================
// GenerateSlug
// ============================================================

func TestGenerateSlug(t *testing.T) {
	tests := []struct {
		name  string
		title string
	}{
		{
			name:  "simple title",
			title: "My Awesome Tournament",
		},
		{
			name:  "single word",
			title: "Contest",
		},
		{
			name:  "already lowercase",
			title: "editing battle",
		},
		{
			name:  "empty title",
			title: "",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			slug := controllers.GenerateSlug(tt.title)

			assert.Equal(t, strings.ToLower(slug), slug)
			assert.NotContains(t, slug, " ")

			parts := strings.Split(slug, "-")
			last := parts[len(parts)-1]

			assert.Len(t, last, 6)

			expectedPrefix := strings.ToLower(
				strings.ReplaceAll(tt.title, " ", "-"),
			)

			assert.True(
				t,
				strings.HasPrefix(slug, expectedPrefix),
			)
		})
	}

	t.Run("two calls produce different slugs", func(t *testing.T) {
		s1 := controllers.GenerateSlug("Same Title")
		s2 := controllers.GenerateSlug("Same Title")

		assert.NotEqual(t, s1, s2)
	})
}

// ============================================================
// CreateTournament
// ============================================================

func TestCreateTournament_Unauthorized_NoRole(t *testing.T) {
	c, w := newTestContext(http.MethodPost, "{}")

	controllers.CreateTournament(nil)(c)

	assert.Equal(t, http.StatusUnauthorized, w.Code)

	body := decodeBody(t, w)

	assert.Equal(t, "Unauthorized", body["error"])
}

func TestCreateTournament_Unauthorized_WrongRole(t *testing.T) {
	c, w := newTestContext(http.MethodPost, "{}")

	c.Set("role", "editor")

	controllers.CreateTournament(nil)(c)

	assert.Equal(t, http.StatusUnauthorized, w.Code)

	body := decodeBody(t, w)

	assert.Equal(t, "Unauthorized", body["error"])
}

func TestCreateTournament_InvalidJSON(t *testing.T) {
	c, w := newTestContext(
		http.MethodPost,
		"{not-valid-json",
	)

	c.Set("role", "admin")

	controllers.CreateTournament(nil)(c)

	assert.Equal(t, http.StatusBadRequest, w.Code)

	body := decodeBody(t, w)

	// Matches current controller typo.
	assert.Equal(t, "Invlaid input", body["error"])
}

func TestCreateTournament_MissingRequiredFields(t *testing.T) {
	payload := `{
		"description": "desc"
	}`

	c, w := newTestContext(
		http.MethodPost,
		payload,
	)

	c.Set("role", "admin")

	controllers.CreateTournament(nil)(c)

	assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestCreateTournament_EndTimeBeforeStartTime(t *testing.T) {
	payload := `{
		"title": "Test Tournament",
		"description": "Test description",
		"start_time": "2026-01-01T10:00:00Z",
		"end_time": "2026-01-01T09:00:00Z",
		"max_participants": 10,
		"prize_pool": 100,
		"assets_link": "http://example.com/assets",
		"judge_email": "judge@example.com"
	}`

	c, w := newTestContext(
		http.MethodPost,
		payload,
	)

	c.Set("role", "admin")

	controllers.CreateTournament(nil)(c)

	assert.Equal(t, http.StatusBadRequest, w.Code)

	body := decodeBody(t, w)

	assert.Equal(
		t,
		"End time must be after start time",
		body["error"],
	)
}

func TestCreateTournament_EndTimeEqualStartTime(t *testing.T) {
	payload := `{
		"title": "Test Tournament",
		"description": "Test description",
		"start_time": "2026-01-01T10:00:00Z",
		"end_time": "2026-01-01T10:00:00Z",
		"max_participants": 10,
		"prize_pool": 100,
		"assets_link": "http://example.com/assets",
		"judge_email": "judge@example.com"
	}`

	c, w := newTestContext(
		http.MethodPost,
		payload,
	)

	c.Set("role", "admin")

	controllers.CreateTournament(nil)(c)

	// Equal times are not Before(), so this reaches the DB layer.
	// With nil Mongo client the handler will not successfully create it.
	// We only ensure that the request does not trigger the time validation.
	assert.NotEqual(
		t,
		http.StatusBadRequest,
		w.Code,
	)
}

// ============================================================
// CreateVoteContestHandler
// ============================================================

func TestCreateVoteContestHandler_Unauthorized(t *testing.T) {
	c, w := newTestContext(
		http.MethodPost,
		"{}",
	)

	controllers.CreateVoteContestHandler(nil)(c)

	assert.Equal(
		t,
		http.StatusUnauthorized,
		w.Code,
	)

	body := decodeBody(t, w)

	assert.Equal(
		t,
		"Unauthorized",
		body["error"],
	)
}

func TestCreateVoteContestHandler_Unauthorized_WrongRole(t *testing.T) {
	c, w := newTestContext(
		http.MethodPost,
		"{}",
	)

	c.Set("role", "user")

	controllers.CreateVoteContestHandler(nil)(c)

	assert.Equal(
		t,
		http.StatusUnauthorized,
		w.Code,
	)

	body := decodeBody(t, w)

	assert.Equal(
		t,
		"Unauthorized",
		body["error"],
	)
}

func TestCreateVoteContestHandler_InvalidJSON(t *testing.T) {
	c, w := newTestContext(
		http.MethodPost,
		"not-json",
	)

	c.Set("role", "admin")

	controllers.CreateVoteContestHandler(nil)(c)

	assert.Equal(
		t,
		http.StatusBadRequest,
		w.Code,
	)

	body := decodeBody(t, w)

	assert.Equal(
		t,
		"Invalid input",
		body["error"],
	)
}

func TestCreateVoteContestHandler_MissingRequiredFields(t *testing.T) {
	payload := `{
		"title": "Only Title"
	}`

	c, w := newTestContext(
		http.MethodPost,
		payload,
	)

	c.Set("role", "admin")

	controllers.CreateVoteContestHandler(nil)(c)

	assert.Equal(
		t,
		http.StatusBadRequest,
		w.Code,
	)
}

func TestCreateVoteContestHandler_EmptyJSON(t *testing.T) {
	c, w := newTestContext(
		http.MethodPost,
		"{}",
	)

	c.Set("role", "admin")

	controllers.CreateVoteContestHandler(nil)(c)

	assert.Equal(
		t,
		http.StatusBadRequest,
		w.Code,
	)
}

// ============================================================
// UpdateTournament
// ============================================================

func TestUpdateTournament_Unauthorized(t *testing.T) {
	c, w := newTestContext(
		http.MethodPatch,
		"{}",
	)

	setParam(
		c,
		"id",
		"64f1a1a1a1a1a1a1a1a1a1a1",
	)

	controllers.UpdateTournament(nil)(c)

	assert.Equal(
		t,
		http.StatusUnauthorized,
		w.Code,
	)

	body := decodeBody(t, w)

	assert.Equal(
		t,
		"Unauthorized",
		body["error"],
	)
}

func TestUpdateTournament_InvalidID(t *testing.T) {
	c, w := newTestContext(
		http.MethodPatch,
		"{}",
	)

	c.Set("role", "admin")

	setParam(
		c,
		"id",
		"not-a-valid-object-id",
	)

	controllers.UpdateTournament(nil)(c)

	assert.Equal(
		t,
		http.StatusBadRequest,
		w.Code,
	)

	body := decodeBody(t, w)

	assert.Equal(
		t,
		"Invalid tournament ID",
		body["error"],
	)
}

func TestUpdateTournament_InvalidJSON(t *testing.T) {
	c, w := newTestContext(
		http.MethodPatch,
		"{bad-json",
	)

	c.Set("role", "admin")

	setParam(
		c,
		"id",
		"64f1a1a1a1a1a1a1a1a1a1a1",
	)

	controllers.UpdateTournament(nil)(c)

	assert.Equal(
		t,
		http.StatusBadRequest,
		w.Code,
	)
}

// ============================================================
// GetLeaderboard
// ============================================================

func TestGetLeaderboard_InvalidID(t *testing.T) {
	c, w := newTestContext(
		http.MethodGet,
		"",
	)

	setParam(
		c,
		"id",
		"not-an-object-id",
	)

	controllers.GetLeaderboard(nil)(c)

	assert.Equal(
		t,
		http.StatusBadRequest,
		w.Code,
	)

	body := decodeBody(t, w)

	assert.Equal(
		t,
		"Invalid tournament ID",
		body["error"],
	)
}

// ============================================================
// AdminApproveTournament
// ============================================================

func TestAdminApproveTournament_InvalidID(t *testing.T) {
	c, w := newTestContext(
		http.MethodPost,
		"",
	)

	setParam(
		c,
		"id",
		"not-an-object-id",
	)

	controllers.AdminApproveTournament(nil)(c)

	assert.Equal(
		t,
		http.StatusBadRequest,
		w.Code,
	)

	body := decodeBody(t, w)

	assert.Equal(
		t,
		"Invalid tournament ID",
		body["error"],
	)
}

func TestAdminApproveTournament_EmptyID(t *testing.T) {
	c, w := newTestContext(
		http.MethodPost,
		"",
	)

	setParam(
		c,
		"id",
		"",
	)

	controllers.AdminApproveTournament(nil)(c)

	assert.Equal(
		t,
		http.StatusBadRequest,
		w.Code,
	)

	body := decodeBody(t, w)

	assert.Equal(
		t,
		"Invalid tournament ID",
		body["error"],
	)
}

func TestAdminApproveTournament_MalformedID(t *testing.T) {
	c, w := newTestContext(
		http.MethodPost,
		"",
	)

	setParam(
		c,
		"id",
		"123456",
	)

	controllers.AdminApproveTournament(nil)(c)

	assert.Equal(
		t,
		http.StatusBadRequest,
		w.Code,
	)

	body := decodeBody(t, w)

	assert.Equal(
		t,
		"Invalid tournament ID",
		body["error"],
	)
}

// ============================================================
// AdminPublishVoteLeaderboard
// ============================================================

func TestAdminPublishVoteLeaderboard_InvalidID(t *testing.T) {
	c, w := newTestContext(
		http.MethodPost,
		"",
	)

	setParam(
		c,
		"id",
		"not-an-object-id",
	)

	controllers.AdminPublishVoteLeaderboard(nil)(c)

	assert.Equal(
		t,
		http.StatusBadRequest,
		w.Code,
	)

	body := decodeBody(t, w)

	assert.Equal(
		t,
		"Invalid tournament ID format",
		body["error"],
	)
}

func TestAdminPublishVoteLeaderboard_EmptyID(t *testing.T) {
	c, w := newTestContext(
		http.MethodPost,
		"",
	)

	setParam(
		c,
		"id",
		"",
	)

	controllers.AdminPublishVoteLeaderboard(nil)(c)

	assert.Equal(
		t,
		http.StatusBadRequest,
		w.Code,
	)

	body := decodeBody(t, w)

	assert.Equal(
		t,
		"Invalid tournament ID format",
		body["error"],
	)
}

func TestAdminPublishVoteLeaderboard_MalformedID(t *testing.T) {
	c, w := newTestContext(
		http.MethodPost,
		"",
	)

	setParam(
		c,
		"id",
		"123456",
	)

	controllers.AdminPublishVoteLeaderboard(nil)(c)

	assert.Equal(
		t,
		http.StatusBadRequest,
		w.Code,
	)

	body := decodeBody(t, w)

	assert.Equal(
		t,
		"Invalid tournament ID format",
		body["error"],
	)
}

// ============================================================
// CreateTournament / role edge cases
// ============================================================

func TestCreateTournament_NilRole(t *testing.T) {
	c, w := newTestContext(
		http.MethodPost,
		`{}`,
	)

	c.Set("role", nil)

	controllers.CreateTournament(nil)(c)

	assert.Equal(
		t,
		http.StatusUnauthorized,
		w.Code,
	)
}

func TestCreateVoteContestHandler_NilRole(t *testing.T) {
	c, w := newTestContext(
		http.MethodPost,
		`{}`,
	)

	c.Set("role", nil)

	controllers.CreateVoteContestHandler(nil)(c)

	assert.Equal(
		t,
		http.StatusUnauthorized,
		w.Code,
	)
}

// ============================================================
// Time logic
// ============================================================

func TestTimeParsingAssumption(t *testing.T) {
	start, err := time.Parse(
		time.RFC3339,
		"2026-01-01T10:00:00Z",
	)

	assert.NoError(t, err)

	end, err := time.Parse(
		time.RFC3339,
		"2026-01-01T09:00:00Z",
	)

	assert.NoError(t, err)

	assert.True(
		t,
		end.Before(start),
	)
}

func TestTimeParsingValidRange(t *testing.T) {
	start, err := time.Parse(
		time.RFC3339,
		"2026-01-01T09:00:00Z",
	)

	assert.NoError(t, err)

	end, err := time.Parse(
		time.RFC3339,
		"2026-01-01T10:00:00Z",
	)

	assert.NoError(t, err)

	assert.True(
		t,
		end.After(start),
	)
}

func TestTimeParsingEqualTimes(t *testing.T) {
	start, err := time.Parse(
		time.RFC3339,
		"2026-01-01T10:00:00Z",
	)

	assert.NoError(t, err)

	end, err := time.Parse(
		time.RFC3339,
		"2026-01-01T10:00:00Z",
	)

	assert.NoError(t, err)

	assert.False(
		t,
		end.Before(start),
	)
}

// ============================================================
// Feature posts
// ============================================================

func TestCreateFeaturePost_Unauthorized(t *testing.T) {
	c, w := newTestContext(
		http.MethodPost,
		"{}",
	)

	controllers.CreateFeaturePost(nil)(c)

	assert.Equal(
		t,
		http.StatusUnauthorized,
		w.Code,
	)

	body := decodeBody(t, w)

	assert.Equal(
		t,
		"Unauthorized",
		body["error"],
	)
}

func TestCreateFeaturePost_Unauthorized_WrongRole(t *testing.T) {
	c, w := newTestContext(
		http.MethodPost,
		"{}",
	)

	c.Set("role", "guest")

	controllers.CreateFeaturePost(nil)(c)

	assert.Equal(
		t,
		http.StatusUnauthorized,
		w.Code,
	)
}

func TestCreateFeaturePost_Unauthorized_UserRole(t *testing.T) {
	c, w := newTestContext(
		http.MethodPost,
		"{}",
	)

	c.Set("role", "user")

	controllers.CreateFeaturePost(nil)(c)

	assert.Equal(
		t,
		http.StatusUnauthorized,
		w.Code,
	)
}
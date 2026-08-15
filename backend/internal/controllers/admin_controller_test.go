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

func newTestContext(method, body string) (*gin.Context, *httptest.ResponseRecorder) {
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	var req *http.Request
	if body != "" {
		req = httptest.NewRequest(method, "/", bytes.NewBufferString(body))
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

func TestGenerateSlug(t *testing.T) {
	tests := []struct {
		name  string
		title string
	}{
		{"simple title", "My Awesome Tournament"},
		{"single word", "Contest"},
		{"already lowercase", "editing battle"},
		{"empty title", ""},
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

	// Current API response contains this existing typo.
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
		"judge_email": "judge@example.com",
		"skills": ["Go", "MongoDB"],
		"result_time": "2026-01-02T10:00:00Z",
		"label": "Test",
		"cateogry": "Technology"
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

func TestCreateVoteContestHandler_Unauthorized(t *testing.T) {
	c, w := newTestContext(
		http.MethodPost,
		"{}",
	)

	controllers.CreateVoteContestHandler(nil)(c)

	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

func TestCreateVoteContestHandler_Unauthorized_WrongRole(t *testing.T) {
	c, w := newTestContext(
		http.MethodPost,
		"{}",
	)

	c.Set("role", "user")

	controllers.CreateVoteContestHandler(nil)(c)

	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

func TestCreateVoteContestHandler_InvalidJSON(t *testing.T) {
	c, w := newTestContext(
		http.MethodPost,
		"not-json",
	)

	c.Set("role", "admin")

	controllers.CreateVoteContestHandler(nil)(c)

	assert.Equal(t, http.StatusBadRequest, w.Code)

	body := decodeBody(t, w)

	assert.Equal(t, "Invalid input", body["error"])
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

	assert.Equal(t, http.StatusBadRequest, w.Code)
}

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

	assert.Equal(t, http.StatusUnauthorized, w.Code)
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

	assert.Equal(t, http.StatusBadRequest, w.Code)

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

	assert.Equal(t, http.StatusBadRequest, w.Code)
}

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

	assert.Equal(t, http.StatusBadRequest, w.Code)

	body := decodeBody(t, w)

	assert.Equal(
		t,
		"Invalid tournament ID",
		body["error"],
	)
}

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

	assert.Equal(t, http.StatusBadRequest, w.Code)

	body := decodeBody(t, w)

	assert.Equal(
		t,
		"Invalid tournament ID",
		body["error"],
	)
}

func TestCreateFeaturePost_Unauthorized(t *testing.T) {
	c, w := newTestContext(
		http.MethodPost,
		"{}",
	)

	controllers.CreateFeaturePost(nil)(c)

	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

func TestCreateFeaturePost_Unauthorized_WrongRole(t *testing.T) {
	c, w := newTestContext(
		http.MethodPost,
		"{}",
	)

	c.Set("role", "guest")

	controllers.CreateFeaturePost(nil)(c)

	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

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

	assert.True(t, end.Before(start))
}
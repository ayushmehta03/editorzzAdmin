package controllers
 
import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"
 
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)
 
func TestMain(m *testing.M) {
	gin.SetMode(gin.TestMode)
	m.Run()
}
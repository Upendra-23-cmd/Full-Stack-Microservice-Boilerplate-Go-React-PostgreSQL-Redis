package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/microservice/backend/internal/cache"
	"github.com/microservice/backend/internal/middleware"
	"github.com/microservice/backend/internal/models"
	"github.com/microservice/backend/internal/repository"
	"golang.org/x/crypto/bcrypt"
)

type Handler struct {
	db        *repository.DB
	cache     *cache.Cache
	jwtSecret string
}

func New(db *repository.DB, c *cache.Cache, jwtSecret string) *Handler {
	return &Handler{db: db, cache: c, jwtSecret: jwtSecret}
}

// ---- Health ----

func (h *Handler) Health(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}

// ---- Auth ----

func (h *Handler) Register(c *gin.Context) {
	var req models.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.Err(err.Error()))
		return
	}
	user, err := h.db.CreateUser(c, req)
	if err != nil {
		c.JSON(http.StatusConflict, models.Err("email already in use"))
		return
	}
	token, err := middleware.GenerateToken(user.ID, h.jwtSecret)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.Err("token error"))
		return
	}
	c.JSON(http.StatusCreated, models.OK(models.AuthResponse{Token: token, User: *user}))
}

func (h *Handler) Login(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.Err(err.Error()))
		return
	}
	user, err := h.db.GetUserByEmail(c, req.Email)
	if err != nil {
		c.JSON(http.StatusUnauthorized, models.Err("invalid credentials"))
		return
	}
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, models.Err("invalid credentials"))
		return
	}
	token, err := middleware.GenerateToken(user.ID, h.jwtSecret)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.Err("token error"))
		return
	}
	c.JSON(http.StatusOK, models.OK(models.AuthResponse{Token: token, User: *user}))
}

func (h *Handler) Me(c *gin.Context) {
	uid := c.GetString(middleware.ContextUserKey)
	user, err := h.db.GetUserByID(c, uid)
	if err != nil {
		c.JSON(http.StatusNotFound, models.Err("user not found"))
		return
	}
	c.JSON(http.StatusOK, models.OK(user))
}

// ---- Products ----

func (h *Handler) ListProducts(c *gin.Context) {
	var products []models.Product
	err := h.cache.GetOrSet(c, "products:all", cache.ProductsTTL, &products, func() (any, error) {
		return h.db.ListProducts(c)
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.Err(err.Error()))
		return
	}
	if products == nil {
		products = []models.Product{}
	}
	c.JSON(http.StatusOK, models.OK(products))
}

func (h *Handler) CreateProduct(c *gin.Context) {
	var req models.CreateProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.Err(err.Error()))
		return
	}
	product, err := h.db.CreateProduct(c, req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.Err(err.Error()))
		return
	}
	// Bust cache
	h.cache.Del(c, "products:all")
	c.JSON(http.StatusCreated, models.OK(product))
}

func (h *Handler) GetProduct(c *gin.Context) {
	id := c.Param("id")
	var product models.Product
	err := h.cache.GetOrSet(c, "product:"+id, cache.ProductsTTL, &product, func() (any, error) {
		return h.db.GetProduct(c, id)
	})
	if err != nil {
		c.JSON(http.StatusNotFound, models.Err("product not found"))
		return
	}
	c.JSON(http.StatusOK, models.OK(product))
}

// ---- Orders ----

func (h *Handler) CreateOrder(c *gin.Context) {
	uid := c.GetString(middleware.ContextUserKey)
	var req models.CreateOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.Err(err.Error()))
		return
	}
	order, err := h.db.CreateOrder(c, uid, req)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.Err(err.Error()))
		return
	}
	// Bust product cache after stock update
	h.cache.Del(c, "products:all")
	c.JSON(http.StatusCreated, models.OK(order))
}

func (h *Handler) ListOrders(c *gin.Context) {
	uid := c.GetString(middleware.ContextUserKey)
	orders, err := h.db.ListOrdersByUser(c, uid)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.Err(err.Error()))
		return
	}
	if orders == nil {
		orders = []models.Order{}
	}
	c.JSON(http.StatusOK, models.OK(orders))
}

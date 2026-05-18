package repository

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/microservice/backend/internal/models"
	"golang.org/x/crypto/bcrypt"
)

type DB struct {
	pool *pgxpool.Pool
}

func NewDB(ctx context.Context, dsn string) (*DB, error) {
	pool, err := pgxpool.New(ctx, dsn)
	if err != nil {
		return nil, fmt.Errorf("pgxpool.New: %w", err)
	}
	if err := pool.Ping(ctx); err != nil {
		return nil, fmt.Errorf("db ping: %w", err)
	}
	return &DB{pool: pool}, nil
}

func (db *DB) Close() { db.pool.Close() }

// Migrate runs minimal schema creation
func (db *DB) Migrate(ctx context.Context) error {
	_, err := db.pool.Exec(ctx, `
		CREATE EXTENSION IF NOT EXISTS "pgcrypto";

		CREATE TABLE IF NOT EXISTS users (
			id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			email         TEXT UNIQUE NOT NULL,
			name          TEXT NOT NULL,
			password_hash TEXT NOT NULL,
			created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
		);

		CREATE TABLE IF NOT EXISTS products (
			id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			name          TEXT NOT NULL,
			description   TEXT NOT NULL DEFAULT '',
			price         NUMERIC(12,2) NOT NULL,
			stock         INTEGER NOT NULL DEFAULT 0,
			created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
		);

		CREATE TABLE IF NOT EXISTS orders (
			id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			user_id    UUID NOT NULL REFERENCES users(id),
			total      NUMERIC(12,2) NOT NULL,
			status     TEXT NOT NULL DEFAULT 'pending',
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		);

		CREATE TABLE IF NOT EXISTS order_items (
			id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			order_id   UUID NOT NULL REFERENCES orders(id),
			product_id UUID NOT NULL REFERENCES products(id),
			quantity   INTEGER NOT NULL,
			price      NUMERIC(12,2) NOT NULL
		);
	`)
	return err
}

// ---- Users ----

func (db *DB) CreateUser(ctx context.Context, req models.RegisterRequest) (*models.User, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}
	u := &models.User{}
	err = db.pool.QueryRow(ctx,
		`INSERT INTO users (email, name, password_hash) VALUES ($1, $2, $3)
		 RETURNING id, email, name, created_at, updated_at`,
		req.Email, req.Name, string(hash),
	).Scan(&u.ID, &u.Email, &u.Name, &u.CreatedAt, &u.UpdatedAt)
	return u, err
}

func (db *DB) GetUserByEmail(ctx context.Context, email string) (*models.User, error) {
	u := &models.User{}
	err := db.pool.QueryRow(ctx,
		`SELECT id, email, name, password_hash, created_at, updated_at FROM users WHERE email=$1`,
		email,
	).Scan(&u.ID, &u.Email, &u.Name, &u.Password, &u.CreatedAt, &u.UpdatedAt)
	return u, err
}

func (db *DB) GetUserByID(ctx context.Context, id string) (*models.User, error) {
	u := &models.User{}
	err := db.pool.QueryRow(ctx,
		`SELECT id, email, name, created_at, updated_at FROM users WHERE id=$1`, id,
	).Scan(&u.ID, &u.Email, &u.Name, &u.CreatedAt, &u.UpdatedAt)
	return u, err
}

// ---- Products ----

func (db *DB) CreateProduct(ctx context.Context, req models.CreateProductRequest) (*models.Product, error) {
	p := &models.Product{}
	err := db.pool.QueryRow(ctx,
		`INSERT INTO products (name, description, price, stock)
		 VALUES ($1,$2,$3,$4)
		 RETURNING id, name, description, price, stock, created_at, updated_at`,
		req.Name, req.Description, req.Price, req.Stock,
	).Scan(&p.ID, &p.Name, &p.Description, &p.Price, &p.Stock, &p.CreatedAt, &p.UpdatedAt)
	return p, err
}

func (db *DB) ListProducts(ctx context.Context) ([]models.Product, error) {
	rows, err := db.pool.Query(ctx,
		`SELECT id, name, description, price, stock, created_at, updated_at FROM products ORDER BY created_at DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var products []models.Product
	for rows.Next() {
		var p models.Product
		if err := rows.Scan(&p.ID, &p.Name, &p.Description, &p.Price, &p.Stock, &p.CreatedAt, &p.UpdatedAt); err != nil {
			return nil, err
		}
		products = append(products, p)
	}
	return products, nil
}

func (db *DB) GetProduct(ctx context.Context, id string) (*models.Product, error) {
	p := &models.Product{}
	err := db.pool.QueryRow(ctx,
		`SELECT id, name, description, price, stock, created_at, updated_at FROM products WHERE id=$1`, id,
	).Scan(&p.ID, &p.Name, &p.Description, &p.Price, &p.Stock, &p.CreatedAt, &p.UpdatedAt)
	return p, err
}

// ---- Orders ----

func (db *DB) CreateOrder(ctx context.Context, userID string, req models.CreateOrderRequest) (*models.Order, error) {
	tx, err := db.pool.Begin(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx)

	var total float64
	var items []models.OrderItem

	for _, item := range req.Items {
		var price float64
		var stock int
		err := tx.QueryRow(ctx,
			`SELECT price, stock FROM products WHERE id=$1 FOR UPDATE`, item.ProductID,
		).Scan(&price, &stock)
		if err != nil {
			return nil, fmt.Errorf("product %s not found", item.ProductID)
		}
		if stock < item.Quantity {
			return nil, fmt.Errorf("insufficient stock for product %s", item.ProductID)
		}
		_, err = tx.Exec(ctx,
			`UPDATE products SET stock=stock-$1, updated_at=NOW() WHERE id=$2`,
			item.Quantity, item.ProductID)
		if err != nil {
			return nil, err
		}
		total += price * float64(item.Quantity)
		items = append(items, models.OrderItem{
			ID:        uuid.New().String(),
			ProductID: item.ProductID,
			Quantity:  item.Quantity,
			Price:     price,
		})
	}

	order := &models.Order{
		UserID:    userID,
		Total:     total,
		Status:    "pending",
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
	err = tx.QueryRow(ctx,
		`INSERT INTO orders (user_id, total, status) VALUES ($1,$2,$3) RETURNING id, created_at, updated_at`,
		userID, total, "pending",
	).Scan(&order.ID, &order.CreatedAt, &order.UpdatedAt)
	if err != nil {
		return nil, err
	}

	for i := range items {
		items[i].OrderID = order.ID
		_, err = tx.Exec(ctx,
			`INSERT INTO order_items (id, order_id, product_id, quantity, price) VALUES ($1,$2,$3,$4,$5)`,
			items[i].ID, order.ID, items[i].ProductID, items[i].Quantity, items[i].Price)
		if err != nil {
			return nil, err
		}
	}

	order.Items = items
	return order, tx.Commit(ctx)
}

func (db *DB) ListOrdersByUser(ctx context.Context, userID string) ([]models.Order, error) {
	rows, err := db.pool.Query(ctx,
		`SELECT id, user_id, total, status, created_at, updated_at FROM orders WHERE user_id=$1 ORDER BY created_at DESC`,
		userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var orders []models.Order
	for rows.Next() {
		var o models.Order
		if err := rows.Scan(&o.ID, &o.UserID, &o.Total, &o.Status, &o.CreatedAt, &o.UpdatedAt); err != nil {
			return nil, err
		}
		orders = append(orders, o)
	}
	return orders, nil
}

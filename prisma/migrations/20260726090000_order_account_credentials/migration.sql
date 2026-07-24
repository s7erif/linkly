-- Additive: store hashed digital-customer credentials on the pending Order.
-- The CustomerAccount is only created on admin approval; the plaintext password is never persisted.
ALTER TABLE "Order" ADD COLUMN "accountPasswordHash" BYTEA;
ALTER TABLE "Order" ADD COLUMN "accountPasswordSalt" BYTEA;

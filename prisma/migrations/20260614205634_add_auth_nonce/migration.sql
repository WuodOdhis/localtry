-- CreateTable
CREATE TABLE "AuthNonce" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "wallet" TEXT NOT NULL,
    "nonce" TEXT NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "AuthNonce_nonce_key" ON "AuthNonce"("nonce");

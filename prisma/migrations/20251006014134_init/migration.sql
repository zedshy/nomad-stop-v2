-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "popular" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "allergens" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "product_variants" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    CONSTRAINT "product_variants_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "addons" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    CONSTRAINT "addons_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL,
    "fulfilment" TEXT NOT NULL,
    "slotStart" DATETIME,
    "slotEnd" DATETIME,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "customerEmail" TEXT,
    "addressLine1" TEXT,
    "city" TEXT,
    "postcode" TEXT,
    "notes" TEXT,
    "subtotal" INTEGER NOT NULL,
    "deliveryFee" INTEGER NOT NULL,
    "tip" INTEGER NOT NULL,
    "serviceFee" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'GBP'
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "addons" JSONB,
    "allergens" TEXT NOT NULL,
    CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "gateway" TEXT NOT NULL DEFAULT 'worldpay',
    "status" TEXT NOT NULL,
    "worldpayRef" TEXT,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'GBP',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "capturedAt" DATETIME,
    CONSTRAINT "payments_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "products_slug_key" ON "products"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "payments_orderId_key" ON "payments"("orderId");

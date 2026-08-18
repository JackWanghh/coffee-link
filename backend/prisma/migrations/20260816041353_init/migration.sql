-- CreateEnum
CREATE TYPE "SessionType" AS ENUM ('coffee', 'topicSwap');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('pendingResponse', 'needsNewTime', 'acceptedPendingPayment', 'swapScheduled', 'declined', 'expired', 'booked', 'completed', 'inAfterSale', 'refunding', 'cancelled');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('wechat', 'alipay');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'success', 'failed', 'refunded');

-- CreateEnum
CREATE TYPE "ComplaintStatus" AS ENUM ('open', 'resolved', 'refunded');

-- CreateEnum
CREATE TYPE "CredentialStatus" AS ENUM ('declared', 'verified');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "phone" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "title" TEXT NOT NULL DEFAULT '',
    "company" TEXT NOT NULL DEFAULT '',
    "avatarUrl" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "declarationNote" TEXT NOT NULL DEFAULT '职业信息由用户自行填写，平台未核验',
    "highlights" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isSharingOpen" BOOLEAN NOT NULL DEFAULT false,
    "signatureDrinkId" UUID,
    "acceptsTopicSwap" BOOLEAN NOT NULL DEFAULT false,
    "weeklySwapLimit" INTEGER NOT NULL DEFAULT 3,
    "appearanceThemeId" TEXT NOT NULL DEFAULT 'obsidian',
    "autoCalendarSync" BOOLEAN NOT NULL DEFAULT true,
    "defaultMeetingReady" BOOLEAN NOT NULL DEFAULT true,
    "hapticsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "meetingLink" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "deletedAt" TIMESTAMPTZ,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMPTZ NOT NULL,
    "revokedAt" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SmsCode" (
    "id" UUID NOT NULL,
    "phone" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMPTZ NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SmsCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isRestricted" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoffeeDrink" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "icon" TEXT NOT NULL DEFAULT 'cup.and.saucer',
    "description" TEXT NOT NULL,
    "tag" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CoffeeDrink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Theme" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "categoryId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "durationMinutes" INTEGER NOT NULL DEFAULT 30,
    "includes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "excludes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "Theme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Credential" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "issuer" TEXT NOT NULL,
    "status" "CredentialStatus" NOT NULL DEFAULT 'declared',
    "url" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Credential_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Slot" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "slotAt" TIMESTAMPTZ NOT NULL,
    "label" TEXT NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Slot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" UUID NOT NULL,
    "type" "SessionType" NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "senderId" UUID NOT NULL,
    "receiverId" UUID NOT NULL,
    "themeId" UUID NOT NULL,
    "offeredThemeId" UUID,
    "question" TEXT NOT NULL,
    "offering" TEXT,
    "receiverQuestion" TEXT,
    "candidateSlots" JSONB NOT NULL,
    "confirmedSlotId" TEXT,
    "confirmedSlotLabel" TEXT,
    "drinkSnapshot" JSONB,
    "priceCents" INTEGER,
    "paymentMethod" "PaymentMethod",
    "paymentDeadlineAt" TIMESTAMPTZ,
    "expiresAt" TIMESTAMPTZ,
    "startsAt" TIMESTAMPTZ,
    "endsAt" TIMESTAMPTZ,
    "status" "SessionStatus" NOT NULL,
    "declineReason" TEXT,
    "meetingLink" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" UUID NOT NULL,
    "sessionId" UUID NOT NULL,
    "reviewerId" UUID NOT NULL,
    "revieweeId" UUID NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "tag" TEXT,
    "isSwapReview" BOOLEAN NOT NULL DEFAULT false,
    "isBlindVisible" BOOLEAN NOT NULL DEFAULT false,
    "visibleAt" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Complaint" (
    "id" UUID NOT NULL,
    "sessionId" UUID NOT NULL,
    "reporterId" UUID NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "ComplaintStatus" NOT NULL DEFAULT 'open',
    "adminNote" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Complaint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" UUID NOT NULL,
    "sessionId" UUID NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "providerTradeNo" TEXT,
    "status" "PaymentStatus" NOT NULL DEFAULT 'pending',
    "idempotencyKey" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Settlement" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "periodStart" TIMESTAMPTZ NOT NULL,
    "periodEnd" TIMESTAMPTZ NOT NULL,
    "platformCents" INTEGER NOT NULL,
    "sharerCents" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Settlement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "sessionId" UUID,
    "readAt" TIMESTAMPTZ,
    "pushSentAt" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE INDEX "User_isSharingOpen_idx" ON "User"("isSharingOpen");

-- CreateIndex
CREATE INDEX "User_deletedAt_idx" ON "User"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_tokenHash_key" ON "RefreshToken"("tokenHash");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- CreateIndex
CREATE INDEX "SmsCode_phone_createdAt_idx" ON "SmsCode"("phone", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Category_code_key" ON "Category"("code");

-- CreateIndex
CREATE UNIQUE INDEX "CoffeeDrink_code_key" ON "CoffeeDrink"("code");

-- CreateIndex
CREATE INDEX "Theme_categoryId_idx" ON "Theme"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "Theme_userId_title_key" ON "Theme"("userId", "title");

-- CreateIndex
CREATE INDEX "Credential_userId_idx" ON "Credential"("userId");

-- CreateIndex
CREATE INDEX "Slot_userId_isAvailable_slotAt_idx" ON "Slot"("userId", "isAvailable", "slotAt");

-- CreateIndex
CREATE UNIQUE INDEX "Slot_userId_slotAt_key" ON "Slot"("userId", "slotAt");

-- CreateIndex
CREATE UNIQUE INDEX "Session_orderNumber_key" ON "Session"("orderNumber");

-- CreateIndex
CREATE INDEX "Session_senderId_status_idx" ON "Session"("senderId", "status");

-- CreateIndex
CREATE INDEX "Session_receiverId_status_idx" ON "Session"("receiverId", "status");

-- CreateIndex
CREATE INDEX "Session_status_expiresAt_idx" ON "Session"("status", "expiresAt");

-- CreateIndex
CREATE INDEX "Session_status_endsAt_idx" ON "Session"("status", "endsAt");

-- CreateIndex
CREATE INDEX "Review_revieweeId_isSwapReview_idx" ON "Review"("revieweeId", "isSwapReview");

-- CreateIndex
CREATE UNIQUE INDEX "Review_sessionId_reviewerId_key" ON "Review"("sessionId", "reviewerId");

-- CreateIndex
CREATE INDEX "Complaint_sessionId_idx" ON "Complaint"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_sessionId_key" ON "Payment"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_idempotencyKey_key" ON "Payment"("idempotencyKey");

-- CreateIndex
CREATE UNIQUE INDEX "Settlement_userId_periodStart_key" ON "Settlement"("userId", "periodStart");

-- CreateIndex
CREATE INDEX "Notification_userId_readAt_idx" ON "Notification"("userId", "readAt");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_signatureDrinkId_fkey" FOREIGN KEY ("signatureDrinkId") REFERENCES "CoffeeDrink"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Theme" ADD CONSTRAINT "Theme_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Theme" ADD CONSTRAINT "Theme_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Credential" ADD CONSTRAINT "Credential_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Slot" ADD CONSTRAINT "Slot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "Theme"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_offeredThemeId_fkey" FOREIGN KEY ("offeredThemeId") REFERENCES "Theme"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_revieweeId_fkey" FOREIGN KEY ("revieweeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Settlement" ADD CONSTRAINT "Settlement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE SET NULL ON UPDATE CASCADE;

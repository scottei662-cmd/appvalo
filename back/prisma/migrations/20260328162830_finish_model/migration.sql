-- CreateEnum
CREATE TYPE "Role" AS ENUM ('Controller', 'Duelist', 'Initiator', 'Sentinel');

-- CreateEnum
CREATE TYPE "WeaponCategory" AS ENUM ('Sidearm', 'SMG', 'Shotgun', 'Rifle', 'Sniper', 'Heavy', 'Melee');

-- CreateEnum
CREATE TYPE "NewsType" AS ENUM ('News', 'PatchNote', 'GameUpdate');

-- CreateEnum
CREATE TYPE "Gameplay" AS ENUM ('Aggressive', 'Defensive', 'Polyvalent');

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "gameName" TEXT,
ADD COLUMN     "tagLine" TEXT;

-- CreateTable
CREATE TABLE "agent" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "biography" TEXT NOT NULL,
    "origin" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "portrait" TEXT NOT NULL,
    "fullPortrait" TEXT NOT NULL,
    "background" TEXT,

    CONSTRAINT "agent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ability" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "preview" TEXT,
    "charges" INTEGER NOT NULL,
    "keyboardKey" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,

    CONSTRAINT "ability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "map" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT NOT NULL,

    CONSTRAINT "map_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weapon" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "category" "WeaponCategory" NOT NULL,

    CONSTRAINT "weapon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image" TEXT,
    "url" TEXT NOT NULL,
    "type" "NewsType" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "news_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "build" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gameplay" "Gameplay" NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "agentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "build_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "build_map" (
    "buildId" TEXT NOT NULL,
    "mapId" TEXT NOT NULL,

    CONSTRAINT "build_map_pkey" PRIMARY KEY ("buildId","mapId")
);

-- CreateTable
CREATE TABLE "build_weapon" (
    "buildId" TEXT NOT NULL,
    "weaponId" TEXT NOT NULL,

    CONSTRAINT "build_weapon_pkey" PRIMARY KEY ("buildId","weaponId")
);

-- CreateIndex
CREATE UNIQUE INDEX "agent_name_key" ON "agent"("name");

-- CreateIndex
CREATE UNIQUE INDEX "map_name_key" ON "map"("name");

-- CreateIndex
CREATE UNIQUE INDEX "weapon_name_key" ON "weapon"("name");

-- CreateIndex
CREATE UNIQUE INDEX "news_url_key" ON "news"("url");

-- CreateIndex
CREATE INDEX "news_date_idx" ON "news"("date");

-- CreateIndex
CREATE INDEX "news_type_idx" ON "news"("type");

-- CreateIndex
CREATE INDEX "build_userId_idx" ON "build"("userId");

-- CreateIndex
CREATE INDEX "build_agentId_idx" ON "build"("agentId");

-- AddForeignKey
ALTER TABLE "ability" ADD CONSTRAINT "ability_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "build" ADD CONSTRAINT "build_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "build" ADD CONSTRAINT "build_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "build_map" ADD CONSTRAINT "build_map_buildId_fkey" FOREIGN KEY ("buildId") REFERENCES "build"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "build_map" ADD CONSTRAINT "build_map_mapId_fkey" FOREIGN KEY ("mapId") REFERENCES "map"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "build_weapon" ADD CONSTRAINT "build_weapon_buildId_fkey" FOREIGN KEY ("buildId") REFERENCES "build"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "build_weapon" ADD CONSTRAINT "build_weapon_weaponId_fkey" FOREIGN KEY ("weaponId") REFERENCES "weapon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

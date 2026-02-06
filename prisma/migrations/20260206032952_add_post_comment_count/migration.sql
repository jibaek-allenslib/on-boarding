-- AlterTable
ALTER TABLE `posts` ADD COLUMN `commentCount` INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `batch_logs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `batchName` VARCHAR(100) NOT NULL,
    `status` VARCHAR(20) NOT NULL,
    `startedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `completedAt` DATETIME(3) NULL,
    `errorMessage` TEXT NULL,
    `metadata` TEXT NULL,

    INDEX `batch_logs_batchName_startedAt_idx`(`batchName`, `startedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

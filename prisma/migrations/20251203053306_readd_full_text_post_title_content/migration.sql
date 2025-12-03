-- CreateIndex
CREATE FULLTEXT INDEX `posts_title_content_idx` ON `posts`(`title`, `content`);

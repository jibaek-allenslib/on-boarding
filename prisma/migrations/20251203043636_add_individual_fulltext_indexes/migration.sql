-- CreateIndex
CREATE FULLTEXT INDEX `posts_title_idx` ON `posts`(`title`);

-- CreateIndex
CREATE FULLTEXT INDEX `posts_content_idx` ON `posts`(`content`);

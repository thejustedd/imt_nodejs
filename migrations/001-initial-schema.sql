-- Up
CREATE TABLE IF NOT EXISTS `Message` (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	date TEXT,
	sender TEXT,
	content TEXT
)

-- Down
-- DROP TABLE `Messages`
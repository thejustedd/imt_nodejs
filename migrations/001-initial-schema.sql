-- Up
CREATE TABLE IF NOT EXISTS `Messages` (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	date TEXT,
	name TEXT,
	message TEXT
)

-- Down
-- DROP TABLE `Messages`
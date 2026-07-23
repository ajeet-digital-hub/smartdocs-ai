CREATE TABLE IF NOT EXISTS downloads (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  fileName VARCHAR(255) NOT NULL,
  fileType VARCHAR(50) DEFAULT NULL,
  fileSize BIGINT DEFAULT NULL,
  downloadUrl TEXT DEFAULT NULL,
  downloadedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_userId_downloads (userId),
  INDEX idx_downloadedAt (downloadedAt),
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);
</｜｜DSML｜｜parameter>
</｜｜DSML｜｜invoke>
</｜｜DSML｜｜tool_calls>

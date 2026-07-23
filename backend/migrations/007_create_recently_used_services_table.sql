CREATE TABLE IF NOT EXISTS recently_used_services (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  serviceId VARCHAR(100) NOT NULL,
  lastUsedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  usageCount INT DEFAULT 1,
  UNIQUE KEY unique_user_service_recent (userId, serviceId),
  INDEX idx_userId_recent (userId),
  INDEX idx_serviceId_recent (serviceId),
  INDEX idx_lastUsedAt (lastUsedAt),
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (serviceId) REFERENCES services(id) ON DELETE CASCADE
);
</｜｜DSML｜｜parameter>
</｜｜DSML｜｜invoke>
</｜｜DSML｜｜tool_calls>

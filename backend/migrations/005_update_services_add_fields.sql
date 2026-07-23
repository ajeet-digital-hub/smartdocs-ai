-- Add new columns to services table for enhanced service catalog
-- Note: MySQL does not support "ADD COLUMN IF NOT EXISTS", so we use a try/catch approach via the migrator.
-- The migrator splits by semicolons and runs each statement, so individual failures won't stop the whole migration.
ALTER TABLE services ADD COLUMN slug VARCHAR(255) DEFAULT NULL AFTER name;
ALTER TABLE services ADD COLUMN shortDescription VARCHAR(500) DEFAULT NULL AFTER description;
ALTER TABLE services ADD COLUMN fullDescription TEXT DEFAULT NULL AFTER shortDescription;
ALTER TABLE services ADD COLUMN categoryId VARCHAR(100) DEFAULT NULL AFTER category;
ALTER TABLE services ADD COLUMN image VARCHAR(500) DEFAULT NULL AFTER icon;
ALTER TABLE services ADD COLUMN route VARCHAR(255) DEFAULT NULL AFTER image;
ALTER TABLE services ADD COLUMN status ENUM('active', 'inactive', 'coming_soon') DEFAULT 'active' AFTER route;
ALTER TABLE services ADD COLUMN isActive BOOLEAN DEFAULT TRUE AFTER status;
ALTER TABLE services ADD COLUMN isFeatured BOOLEAN DEFAULT FALSE AFTER isActive;
ALTER TABLE services ADD COLUMN usageCount INT DEFAULT 0 AFTER sortOrder;

-- Update existing services: set slug = id (since id is already slug-like)
UPDATE services SET slug = id WHERE slug IS NULL;

-- Update existing services: set shortDescription = description WHERE shortDescription IS NULL
UPDATE services SET shortDescription = LEFT(description, 200) WHERE shortDescription IS NULL;

-- Update existing services: set route = CONCAT('/dashboard/tools/', id) WHERE route IS NULL
UPDATE services SET route = CONCAT('/dashboard/tools/', id) WHERE route IS NULL;

-- Update existing services: set isActive = TRUE WHERE isActive IS NULL
UPDATE services SET isActive = TRUE WHERE isActive IS NULL;

-- Set categoryId from categories table where category name matches
UPDATE services s 
JOIN categories c ON s.category = c.name 
SET s.categoryId = c.id 
WHERE s.categoryId IS NULL;

-- Add indexes for new fields (MySQL uses "INDEX" not "CREATE INDEX IF NOT EXISTS")
ALTER TABLE services ADD INDEX idx_slug (slug);
ALTER TABLE services ADD INDEX idx_isActive (isActive);
ALTER TABLE services ADD INDEX idx_isFeatured (isFeatured);
ALTER TABLE services ADD INDEX idx_usageCount (usageCount);
ALTER TABLE services ADD INDEX idx_categoryId (categoryId);
</｜｜DSML｜｜parameter>
</｜｜DSML｜｜invoke>
</｜｜DSML｜｜tool_calls>

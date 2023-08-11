CREATE TABLE units (
  `id` INT NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`)
);

CREATE TABLE storages (
  `agent` VARCHAR(256) NOT NULL,
  `key` VARCHAR(256) NOT NULL,
  `type` VARCHAR(256) NOT NULL,
  `value` TEXT NOT NULL,
  PRIMARY KEY (`agent`, `key`)
);

CREATE TABLE events (
  `id` INT NOT NULL AUTO_INCREMENT,
  `agent` VARCHAR(256) NOT NULL,
  `key` VARCHAR(256) NOT NULL,
  `events` VARCHAR(256) NOT NULL,
  PRIMARY KEY (`id`)
);

INSERT INTO `storages` (`agent`, `key`, `type`, `value`) VALUES ('0x1', 'next_category_id', 'number','1');
INSERT INTO `storages` (`agent`, `key`, `type`, `value`) VALUES ('0x1', 'next_discussion_id', 'number','1');

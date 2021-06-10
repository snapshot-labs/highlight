CREATE TABLE messages (
  sig VARCHAR(256) NOT NULL,
  hash VARCHAR(64) NOT NULL,
  author VARCHAR(64) NOT NULL,
  ts BIGINT NOT NULL,
  message JSON,
  PRIMARY KEY (sig),
  INDEX hash (hash)
  INDEX author (author)
  INDEX ts (ts)
);

CREATE TABLE anchors (
  anchor VARCHAR(64) NOT NULL,
  anchor_id VARCHAR(256) NOT NULL,
  sig VARCHAR(256) NOT NULL,
  ts BIGINT NOT NULL,
  PRIMARY KEY (anchor, anchor_id),
  INDEX ts (ts)
);

CREATE TABLE receipts (
  sig VARCHAR(132) NOT NULL,
  address VARCHAR(42) NOT NULL,
  hash VARCHAR(66) NOT NULL,
  domain VARCHAR(256) NOT NULL,
  ts BIGINT NOT NULL,
  PRIMARY KEY (sig),
  INDEX address (address),
  INDEX hash (hash),
  INDEX domain (domain),
  INDEX ts (ts)
);

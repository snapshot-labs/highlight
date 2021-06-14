CREATE TABLE receipts (
  sig VARCHAR(132) NOT NULL,
  address VARCHAR(42) NOT NULL,
  hash VARCHAR(66) NOT NULL,
  PRIMARY KEY (sig),
  INDEX address (address),
  INDEX hash (hash)
);


CREATE TABLE anchors (
  hash VARCHAR(256) NOT NULL,
  anchor VARCHAR(64) NOT NULL, # amazon-s3, ipfs, arweave, ceramic, swarm
  anchor_id VARCHAR(256) NOT NULL,
  PRIMARY KEY (hash, anchor)
);

CREATE TABLE units (
  sig VARCHAR(256) NOT NULL,
  domain VARCHAR(256) NOT NULL,
  address VARCHAR(64) NOT NULL,
  hash VARCHAR(64) NOT NULL,
  ts BIGINT NOT NULL,
  PRIMARY KEY (sig),
  INDEX domain (domain),
  INDEX address (address),
  INDEX hash (hash),
  INDEX ts (ts)
);

CREATE TABLE token (
    id integer,
    part_id integer,
    token_description text,
    token_recommended_mint_price integer,
    url_unscratched text NOT NULL,
    url_scratched text NOT NULL,
    PRIMARY KEY (id, part_id)
);
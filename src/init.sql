CREATE TABLE "users"(
    id bigserial NOT NULL UNIQUE PRIMARY KEY,
    email VARCHAR(512) UNIQUE NOT NULL,
    password VARCHAR(512),
    name VARCHAR(512),
    avatar VARCHAR(512)
);

CREATE TABLE "task"(
    id BIGSERIAL NOT NULL UNIQUE PRIMARY KEY,
    user_id BIGSERIAL NOT NULL,
    name VARCHAR(128) NOT NULL,
    description TEXT DEFAULT '',
    status VARCHAR(32) CHECK(
        status in ('TODO', 'IN_PROGRESS', 'DONE', 'EXPIRED') AND
        status = 'TODO' OR
        (start_time IS NOT NULL AND end_time IS NOT NULL)
    ) DEFAULT 'TODO', -- 'IN_PROGRESS', 'DONE', 'EXPIRED'
    priority VARCHAR(32) DEFAULT 'LOW', -- 'MEDIUM', 'HIGH'

    start_time INT8 DEFAULT NULL,                             -- seconds (EXTRACT(EPOCH FROM now()))::BIGINT,
    end_time INT8 CHECK(end_time >= start_time) DEFAULT NULL, -- seconds (EXTRACT(EPOCH FROM now()))::BIGINT + 3600*24*1000),

    created_date INT8 DEFAULT (EXTRACT(EPOCH FROM now()))::BIGINT,  -- seconds
    updated_date INT8 DEFAULT (EXTRACT(EPOCH FROM now()))::BIGINT,  -- seconds
    is_deleted BOOLEAN DEFAULT FALSE
);


CREATE TABLE "pomodoro_history"(
    id BIGSERIAL NOT NULL UNIQUE PRIMARY KEY,
    user_id BIGSERIAL NOT NULL,
    start_time INT8 DEFAULT (EXTRACT(EPOCH FROM now()))::BIGINT, -- seconds
    end_time INT8 DEFAULT (EXTRACT(EPOCH FROM now()))::BIGINT,   -- seconds
    span INT8 DEFAULT 0
);

CREATE TABLE "pomodoro_setting"(
    id BIGSERIAL NOT NULL UNIQUE PRIMARY KEY,
    user_id BIGSERIAL NOT NULL,
    pomodoro_time INT8 CHECK(pomodoro_time > 0) DEFAULT 25*60,          -- seconds
    break_time INT8 CHECK(break_time > 0) DEFAULT 5*60,                 -- seconds
    long_break_time INT8 CHECK(long_break_time > 0) DEFAULT 15*60       -- seconds
);

CREATE TABLE "ai_history"(
    id BIGSERIAL NOT NULL UNIQUE PRIMARY KEY,
    user_id BIGSERIAL NOT NULL,
    created_date INT8 DEFAULT (EXTRACT(EPOCH FROM now()))::BIGINT,
    role VARCHAR(32) NOT NULL CHECK (role in ('user', 'model')),
    content TEXT NOT NULL
);

CREATE FUNCTION leaderboard(page integer, page_size integer)
RETURNS TABLE(email varchar(512), name varchar(512), avatar varchar(512), time_span integer)
AS $$
SELECT
	users.email AS email,
	users.name AS name,
	users.avatar AS avatar,
	SUM(COALESCE(h.span, 0)) AS time_span
FROM
	users
LEFT JOIN pomodoro_history h ON
    users.id = h.user_id
GROUP BY
	users.id
ORDER BY
	time_span DESC, users.id ASC
LIMIT
	page_size
OFFSET
	page
$$
LANGUAGE SQL;

INSERT INTO public.users (email,"password","name",avatar) VALUES
	 ('dangvinhtuong12@gmail.com','$2b$10$LUocZYJXdLhzXMmdpPB9Te0COG1MrLPLf.5jdCmzGrjhTWMG9ye8u',NULL,NULL),
	 ('phamhuy1112003@gmail.com','$2b$10$jg5sp5EbPQDzzMs9bwdLBeTZT3LIFqBlyNIQsmoZAQ2hp3QcOYZx.','Peter Pham','http://res.cloudinary.com/dupsdtrvy/image/upload/v1736056334/images/1736056332444.png'),
	 ('tlvu0512@gmail.com','$2b$10$oLuIdaKK0CXxqLYaL776TeBKl5goBc7JoA9D58s9UekV6sjQNDj6G','Trinh Long Vu','https://media.licdn.com/dms/image/v2/D5635AQGbkRZbSYAxCA/profile-framedphoto-shrink_400_400/profile-framedphoto-shrink_400_400/0/1728469761148?e=1736672400&v=beta&t=iWQ7WJz_Sezd4i2guZ1p2qnsLI6I7z4ajkDnGvRYIRg');

-- Insert dummy data into the "pomodoro_history" table
INSERT INTO "pomodoro_history" (user_id, start_time, end_time, span)
VALUES
    (1, (EXTRACT(EPOCH FROM TIMESTAMP '2024-12-28 08:00:00'))::BIGINT, (EXTRACT(EPOCH FROM TIMESTAMP '2024-12-28 08:25:00'))::BIGINT, 1500),
    (2, (EXTRACT(EPOCH FROM TIMESTAMP '2024-12-28 09:00:00'))::BIGINT, (EXTRACT(EPOCH FROM TIMESTAMP '2024-12-28 09:25:00'))::BIGINT, 1500),
    (1, (EXTRACT(EPOCH FROM TIMESTAMP '2024-12-28 10:00:00'))::BIGINT, (EXTRACT(EPOCH FROM TIMESTAMP '2024-12-28 10:25:00'))::BIGINT, 1500),
    (3, (EXTRACT(EPOCH FROM TIMESTAMP '2024-12-28 11:00:00'))::BIGINT, (EXTRACT(EPOCH FROM TIMESTAMP '2024-12-28 11:25:00'))::BIGINT, 1500),
    (2, (EXTRACT(EPOCH FROM TIMESTAMP '2024-12-28 13:00:00'))::BIGINT, (EXTRACT(EPOCH FROM TIMESTAMP '2024-12-28 13:25:00'))::BIGINT, 1500),
    (3, (EXTRACT(EPOCH FROM TIMESTAMP '2024-12-28 14:00:00'))::BIGINT, (EXTRACT(EPOCH FROM TIMESTAMP '2024-12-28 14:25:00'))::BIGINT, 1500);

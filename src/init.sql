CREATE TABLE "users"(
    id bigserial not null unique primary key,
    email varchar(512) unique not null,
    password varchar(512),
    name varchar(512),
    avatar varchar(512)
);

CREATE TABLE "task"(
    id bigserial not null unique primary key,
    user_id bigserial not null,
    name varchar(128) not null,
    description text default '',
    status varchar(32) default 'TODO', -- 'IN_PROGRESS', 'DONE'
    priority varchar(32) default 'LOW', -- 'MEDIUM', 'HIGH'
    estimate_time int8 default 3600, -- seconds
    created_date int8 DEFAULT (EXTRACT(EPOCH FROM now()) * 1000)::BIGINT,
    updated_date int8 DEFAULT (EXTRACT(EPOCH FROM now()) * 1000)::BIGINT,
    is_deleted boolean default false
);

CREATE TABLE "todo"(
    id bigserial not null unique primary key,
    user_id bigserial not null,
    task_id bigserial not null,
    start_date int8 not null DEFAULT (EXTRACT(EPOCH FROM now()) * 1000)::BIGINT,
    end_date int8 not null CHECK(end_date >= start_date) DEFAULT (EXTRACT(EPOCH FROM now()) * 1000)::BIGINT + 3600*24*1000);

-- Inserting 3 example tasks
INSERT INTO task (user_id, name, description, status, priority, estimate_time, created_date, updated_date, is_deleted)
VALUES
(1, 'Task 1', 'Description for task 1', 'IN_PROGRESS', 'HIGH', 7200, (EXTRACT(EPOCH FROM now()) * 1000)::BIGINT, (EXTRACT(EPOCH FROM now()) * 1000)::BIGINT, false),
(2, 'Task 2', 'Description for task 2', 'DONE', 'LOW', 3600, (EXTRACT(EPOCH FROM now()) * 1000)::BIGINT, (EXTRACT(EPOCH FROM now()) * 1000)::BIGINT, false),
(3, 'Task 3', 'Description for task 3', 'TODO', 'MEDIUM', 5400, (EXTRACT(EPOCH FROM now()) * 1000)::BIGINT, (EXTRACT(EPOCH FROM now()) * 1000)::BIGINT, false);


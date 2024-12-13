CREATE TABLE "users"(
    id bigserial not null unique,
    email varchar(512) primary key,
    password varchar(512),
    name varchar(512),
    avatar varchar(512)
);

CREATE TABLE "task"(
    id bigserial not null unique primary key,
    id_user bigserial not null,
    name varchar(128) not null,
    description text,
    status varchar(32) default 'TODO', -- 'IN_PROGRESS', 'DONE'
    priority varchar(32) default 'LOW', -- 'MEDIUM', 'HIGH'
    estimate_time int8 default 3600, -- seconds
    is_deleted boolean default false
);

CREATE TABLE "todo"(
    id bigserial not null unique primary key,
    id_task bigserial not null,
    start_date int8 not null,
    end_date int8 not null
);

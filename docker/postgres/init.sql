CREATE DATABASE auth_service;
CREATE DATABASE tasks_service;
CREATE DATABASE notifications_service;

GRANT ALL PRIVILEGES ON DATABASE auth_service TO postgres;
GRANT ALL PRIVILEGES ON DATABASE tasks_service TO postgres;
GRANT ALL PRIVILEGES ON DATABASE notifications_service TO postgres;

\c auth_service;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\c tasks_service;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\c notifications_service;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

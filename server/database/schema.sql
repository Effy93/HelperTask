CREATE DATABASE IF NOT EXISTS task_helper;
USE task_helper;

-- =======================================
-- USER
-- =======================================
CREATE TABLE user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(55) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

-- =======================================
-- PROJECT
-- =======================================
CREATE TABLE project (
    id_project INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(55) NOT NULL,
    description VARCHAR(255),
    status ENUM('todo','doing','done') NOT NULL DEFAULT 'todo',
    position INT NOT NULL DEFAULT 0
);

-- =======================================
-- PROJECT_USER (relation N-N)
-- =======================================
CREATE TABLE project_user (
    project_id INT NOT NULL,
    user_id INT NOT NULL,
    role ENUM('product_owner','collaborator') NOT NULL DEFAULT 'product_owner',
    PRIMARY KEY (project_id, user_id),

    FOREIGN KEY (project_id) REFERENCES project(id_project) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

-- =======================================
-- TASK
-- =======================================
CREATE TABLE task (
    id_task INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(55) NOT NULL,
    content VARCHAR(255),
    status ENUM('todo','doing','done') NOT NULL DEFAULT 'todo',
    position INT NOT NULL DEFAULT 0,
    deadline DATETIME,
    project_id INT NOT NULL,

    FOREIGN KEY (project_id) REFERENCES project(id_project) ON DELETE CASCADE
);

-- =======================================
-- USER_TASK (assignation de tâches)
-- =======================================
CREATE TABLE user_task (
    task_id INT NOT NULL,
    user_id INT NOT NULL,
    PRIMARY KEY (task_id, user_id),

    FOREIGN KEY (task_id) REFERENCES task(id_task) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);
CREATE database if NOT exists task_helper;
use task_helper;
-- =======================================
-- TABLE USER
-- =======================================
CREATE TABLE user (
    id_user INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(55) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

-- =======================================
-- TABLE PROJECT
-- =======================================
CREATE TABLE project (
    id_project INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(55) NOT NULL,
    description VARCHAR(255),
    status ENUM('todo','doing','done') NOT NULL DEFAULT 'todo'
);

-- =======================================
-- TABLE TASK
-- =======================================
CREATE TABLE task (
    id_task INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(55) NOT NULL,
    content VARCHAR(255),
    status ENUM('todo','doing','done') NOT NULL DEFAULT 'todo',
    deadline BIGINT,
    project_id INT NOT NULL,
    FOREIGN KEY (project_id) REFERENCES project(id_project) ON DELETE CASCADE
);

-- =======================================
-- TABLE PROJECT_USER (relation N-M)
-- =======================================
CREATE TABLE project_user (
    project_id INT NOT NULL,
    user_id INT NOT NULL,
    role ENUM('product_owner','collaborator') NOT NULL DEFAULT 'product_owner',
    PRIMARY KEY(project_id,user_id),
    FOREIGN KEY (project_id) REFERENCES project(id_project) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES user(id_user) ON DELETE CASCADE
);

-- =======================================
-- TABLE USER_TASK (relation N-M, optionnelle)
-- =======================================
CREATE TABLE user_task (
    task_id INT NOT NULL,
    user_id INT NOT NULL,
    PRIMARY KEY(task_id,user_id),
    FOREIGN KEY (task_id) REFERENCES task(id_task) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES user(id_user) ON DELETE CASCADE
);
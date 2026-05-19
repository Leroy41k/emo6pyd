<?php

define('DB_PATH', __DIR__ . '/logoped.db');

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

function respond($success, $message = '', $data = [], $code = 200) {
    http_response_code($code);
    echo json_encode(['success'=>$success,'message'=>$message,'data'=>$data], JSON_UNESCAPED_UNICODE);
    exit;
}

function getDB() {
    static $pdo;
    if (!$pdo) {
        $pdo = new PDO('sqlite:' . DB_PATH);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        $pdo->exec("
            CREATE TABLE IF NOT EXISTS leads (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                phone TEXT,
                service TEXT,
                status TEXT DEFAULT 'new',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ");
    }
    return $pdo;
}

$action = $_GET['action'] ?? '';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    respond(true, 'OK');
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $body = json_decode(file_get_contents('php://input'), true);

    if ($action === 'update_status') {
        $id = (int)($body['id'] ?? 0);
        $status = trim($body['status'] ?? '');
        $allowed = ['new', 'in_progress', 'done', 'cancelled'];

        if ($id <= 0 || !in_array($status, $allowed, true)) {
            respond(false, 'Некорректные данные', [], 400);
        }

        $db = getDB();
        $stmt = $db->prepare("UPDATE leads SET status = ? WHERE id = ?");
        $stmt->execute([$status, $id]);

        respond(true, 'Статус обновлен');
    }

    $name = trim($body['name'] ?? '');
    $phone = trim($body['phone'] ?? '');
    $service = trim($body['service'] ?? '');

    if (!$name || !$phone || !$service) {
        respond(false, 'Заполните все поля');
    }

    $db = getDB();

    $stmt = $db->prepare("INSERT INTO leads (name, phone, service) VALUES (?, ?, ?)");
    $stmt->execute([$name, $phone, $service]);

    respond(true, 'Заявка отправлена');
}

if ($action === 'leads') {
    $db = getDB();
    $leads = $db->query("SELECT * FROM leads ORDER BY id DESC")->fetchAll();
    respond(true, '', ['leads'=>$leads]);
}

respond(false, 'Ошибка');
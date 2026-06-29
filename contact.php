<?php

declare(strict_types=1);



header('Content-Type: application/json; charset=utf-8');

const COMPANY_NAME = 'Voltique';
const COMPANY_EMAIL = 'hello@voltique.com';
const COMPANY_ID = 'VQ-ELECTRIC-2048';
const COMPANY_ADDRESS = 'USA Service Area';

const MIN_SUBMIT_SECONDS = 3;
const MAX_FIELD_LENGTH = 4000;

function jsonResponse(bool $success, string $message, int $statusCode = 200): void
{
    http_response_code($statusCode);

    echo json_encode([
        'success' => $success,
        'message' => $message
    ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

    exit;
}

function cleanInput(?string $value, int $maxLength = MAX_FIELD_LENGTH): string
{
    $value = trim((string) $value);
    $value = str_replace(["\r", "\0"], '', $value);
    $value = strip_tags($value);
    $value = htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');

    if (strlen($value) > $maxLength) {
        $value = substr($value, 0, $maxLength);
    }

    return $value;
}

function cleanHeaderValue(?string $value): string
{
    $value = cleanInput($value, 240);

    return str_replace(["\n", "\r"], '', $value);
}

function getPostValue(string $key): string
{
    return isset($_POST[$key]) ? cleanInput((string) $_POST[$key]) : '';
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Invalid request method.', 405);
}

$honeypot = trim((string) ($_POST['website'] ?? ''));

if ($honeypot !== '') {
    jsonResponse(false, 'Please check the required fields and try again.', 400);
}

$formStartedAt = isset($_POST['formStartedAt']) ? (int) $_POST['formStartedAt'] : 0;

if ($formStartedAt > 0) {
    $submittedAfterSeconds = (int) floor(((time() * 1000) - $formStartedAt) / 1000);

    if ($submittedAfterSeconds < MIN_SUBMIT_SECONDS) {
        jsonResponse(false, 'Please check the required fields and try again.', 400);
    }
}

$fullName = getPostValue('fullName');
$email = cleanHeaderValue($_POST['email'] ?? '');
$phone = getPostValue('phone');
$service = getPostValue('service');
$message = getPostValue('message');
$sourcePage = getPostValue('sourcePage');
$privacyConsent = getPostValue('privacyConsent');

$errors = [];

if ($fullName === '' || strlen($fullName) < 2) {
    $errors[] = 'Name is required.';
}

if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'A valid email address is required.';
}

if ($phone === '' || strlen($phone) < 5) {
    $errors[] = 'Phone number is required.';
}

if ($service === '') {
    $errors[] = 'Service category is required.';
}

if ($message === '' || strlen($message) < 10) {
    $errors[] = 'Request details are required.';
}

if ($privacyConsent !== 'yes') {
    $errors[] = 'Consent is required.';
}

if (!empty($errors)) {
    jsonResponse(false, 'Please check the required fields and try again.', 422);
}

$subject = 'New Voltique Electrical Request';

$emailBody = '';
$emailBody .= "New request submitted through " . COMPANY_NAME . "\n";
$emailBody .= "Company ID: " . COMPANY_ID . "\n";
$emailBody .= "Company Address: " . COMPANY_ADDRESS . "\n";
$emailBody .= "------------------------------------------------------------\n\n";

$emailBody .= "Full Name: " . html_entity_decode($fullName, ENT_QUOTES, 'UTF-8') . "\n";
$emailBody .= "Email: " . html_entity_decode($email, ENT_QUOTES, 'UTF-8') . "\n";
$emailBody .= "Phone: " . html_entity_decode($phone, ENT_QUOTES, 'UTF-8') . "\n";
$emailBody .= "Service Category: " . html_entity_decode($service, ENT_QUOTES, 'UTF-8') . "\n";
$emailBody .= "Source Page: " . html_entity_decode($sourcePage, ENT_QUOTES, 'UTF-8') . "\n\n";

$emailBody .= "Request Details:\n";
$emailBody .= html_entity_decode($message, ENT_QUOTES, 'UTF-8') . "\n\n";

$emailBody .= "Consent:\n";
$emailBody .= "The user agreed that submitted request details may be used for contact and may be shared with participating providers for provider-matching purposes.\n\n";

$emailBody .= "Platform Disclaimer:\n";
$emailBody .= COMPANY_NAME . " is an independent provider-matching platform. ";
$emailBody .= COMPANY_NAME . " does not perform electrical work directly. ";
$emailBody .= "Final pricing, availability, scheduling, warranties, licenses, insurance, service terms, and work quality are handled by participating independent providers.\n";

$headers = [];
$headers[] = 'MIME-Version: 1.0';
$headers[] = 'Content-Type: text/plain; charset=UTF-8';
$headers[] = 'From: ' . COMPANY_NAME . ' Request Desk <' . COMPANY_EMAIL . '>';
$headers[] = 'Reply-To: ' . $fullName . ' <' . $email . '>';
$headers[] = 'X-Mailer: PHP/' . phpversion();

$sent = @mail(
    COMPANY_EMAIL,
    $subject,
    $emailBody,
    implode("\r\n", $headers)
);

if (!$sent) {
    jsonResponse(
        false,
        'The request could not be sent right now. Please try again or use the phone option.',
        500
    );
}

jsonResponse(true, 'Thank you. Your request has been received.');

<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'phpmailer/Exception.php';
require 'phpmailer/PHPMailer.php';
require 'phpmailer/SMTP.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = strip_tags(trim($_POST["name"]));
    $email = filter_var(trim($_POST["email"]), FILTER_SANITIZE_EMAIL);
    $message = trim($_POST["message"]);

    $mail = new PHPMailer(true);

    try {
        // Servereinstellungen
        $mail->isSMTP();
        $mail->Host       = 'mail-relay'; // Name deines Containers
        $mail->SMTPAuth   = false;        // Postfix im selben Netzwerk braucht kein Auth von PHP
        $mail->Port       = 25;

        // Empfänger & Absender
        $mail->setFrom('dan@d-net.me', 'Portfolio Contact'); // Muss deine Proton-Domain sein
        $mail->addAddress('dan.dressen@pm.me'); 
        $mail->addReplyTo($email, $name);

        // Inhalt
        $mail->isHTML(false);
        $mail->Subject = "New Inquiry from $name";
        $mail->Body    = "Name: $name\nEmail: $email\n\nMessage:\n$message";

        $mail->send();
        echo "SENT";
    } catch (Exception $e) {
        error_log("Mail Error: {$mail->ErrorInfo}");
        echo "ERROR";
    }
}
?>

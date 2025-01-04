export default `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f7fc;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            padding-bottom: 20px;
        }
        .header h1 {
            font-size: 28px;
            color: #007bff;
        }
        .content {
            font-size: 16px;
            color: #555;
            line-height: 1.6;
        }
        .footer {
            text-align: center;
            font-size: 14px;
            color: #888;
            padding-top: 20px;
        }
        .button {
            display: block;
            width: 100%;
            padding: 12px;
            background-color: #007bff;
            color: white !important;
            text-align: center;
            font-size: 16px;
            border: none;
            border-radius: 5px;
            text-decoration: none;
            margin: 20px 0;
        }
        .button:hover {
            background-color: #0056b3;
        }
    </style>
</head>
<body>

    <div class="container">
        <div class="header">
            <h1>Password Reset</h1>
        </div>

        <div class="content">
            <p>Dear User,</p>
            <p>We received a request to reset your password for your SmartStudyPlanner account. Please click the button below to reset your password:</p>

            <a href="\${RESET_PASSWORD_URI}" class="button">Reset Password</a>

            <p>If you did not request this password reset, you can safely ignore this email. Your password will remain unchanged.</p>
            <p>This link will expire in \${RESET_PASSWORD_EXPIRE_TIME}.</p>

            <p>Best regards,</p>
            <p>The SmartStudyPlanner Team</p>
        </div>

        <div class="footer">
            <p>If you have any questions, feel free to contact us at <a href="mailto:smartstudyplanner25@gmail.com">smartstudyplanner25@gmail.com</a>.</p>
        </div>
    </div>

</body>
</html>
`;

export default `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OTP Verification</title>
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
        .otp {
            font-size: 24px;
            font-weight: bold;
            letter-spacing: 2px;
            color: #333;
            margin: 20px 0;
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
            color: white;
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
            <h1>OTP Verification</h1>
        </div>

        <div class="content">
            <p>Dear User,</p>
            <p>We received a request register you account on SmartStudyPlanner. Please use the OTP below to complete your verification process:</p>

            <div class="otp">
                \${OTP}
            </div>

            <p>This OTP is valid for the next \${OTP_EXPIRE_TIME} minutes. If you did not request this verification, please ignore this email.</p>

            <p>Best regards,</p>
            <p>The SmartStudyPlanner Team</p>
        </div>

        <div class="footer">
            <p>If you have any questions, feel free to contact us at <a href="mailto:helloeverybody648@gmail.com">smartstudyplanner25@gmail.com</a>.</p>
        </div>
    </div>

</body>
</html>
`;

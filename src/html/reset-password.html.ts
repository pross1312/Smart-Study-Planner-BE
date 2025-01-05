export default `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Set New Password</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f7fc;
        }
        .container {
            max-width: 400px;
            margin: 50px auto;
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
            font-size: 24px;
            color: #007bff;
        }
        .form-group {
            margin-bottom: 15px;
        }
        .form-group label {
            display: block;
            font-size: 14px;
            color: #555;
            margin-bottom: 5px;
        }
        .form-group input {
            width: 100%;
            padding: 10px;
            font-size: 14px;
            border: 1px solid #ddd;
            border-radius: 5px;
            box-sizing: border-box;
        }
        .form-group input:focus {
            outline: none;
            border-color: #007bff;
            box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
        }
        .error-message {
            color: #d9534f;
            font-size: 14px;
            margin-bottom: 15px;
            display: none; /* Initially hidden */
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
            cursor: pointer;
        }
        .button:hover {
            background-color: #0056b3;
        }
        .footer {
            text-align: center;
            font-size: 14px;
            color: #888;
            padding-top: 10px;
        }
    </style>
</head>
<body>

    <div class="container">
        <div class="header">
            <h1>Set New Password</h1>
        </div>

        <form id="form" action="/" method="POST">
            <div class="form-group">
                <label for="new-password">New Password</label>
                <input type="password" id="new-password" name="newPassword" placeholder="Enter your new password" required>
            </div>
            <div class="form-group">
                <label for="confirm-password">Confirm Password</label>
                <input type="password" id="confirm-password" name="confirmPassword" placeholder="Confirm your new password" required>
            </div>

            <div class="error-message" id="error-message">
                <!-- Error messages will be displayed here -->
            </div>

            <button type="submit" class="button">Save Password</button>
        </form>

        <div class="footer">
            <p>If you encounter any issues, please contact <a href="mailto:smartstudyplanner25@gmail.com">smartstudyplanner25@gmail.com</a>.</p>
        </div>
    </div>

    <script>
        const form = document.getElementById("form");
        form.onsubmit = (event) => {
            event.preventDefault();
            event.stopPropagation();
            const formData = new FormData(form);
            const newPassword = formData.get("newPassword");
            const confirmPassword = formData.get("confirmPassword");
            const errorMessage = document.getElementById('error-message');

            if (newPassword !== confirmPassword) {
                errorMessage.textContent = 'Passwords do not match. Please try again.';
                errorMessage.style.display = 'block';
            } else if (newPassword.length < 6) {
                errorMessage.textContent = 'Password must be at least 8 characters long.';
                errorMessage.style.display = 'block';
            } else {
                const address = \`\${window.location.origin}/auth/password/reset\`;
                console.log(address);
                fetch(address, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        token: "\${TOKEN}",
                        password: newPassword
                    })
                }).then(async (result) => {
                    const response = await result.json();
                    console.log(response);
                    if (response.success) {
                        alert("Successfully reset password, please try to login again");
                    } else {
                        errorMessage.textContent = response.data
                        errorMessage.style.display = 'block';
                    }
                }).catch(err => {
                    console.log(err);
                });
            }
            return false;
        }
    </script>
</body>
</html>
`

<%@ Page Language="C#" AutoEventWireup="true" CodeFile="Default.aspx.cs" Inherits="_Default" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title>ComaxSupport</title>
    <link href="//maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" rel="stylesheet" />
    <script src="//maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js"></script>
    <script src="//cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
    <link href="css/login.css" rel="stylesheet" />
    <script src="js/login.js"></script>
</head>
<body>
    <div class="wrapper">
        <div id="formContent">
            <div>
                <img src="images/comaxsupportlogo.png" id="icon" alt="Icon" />
            </div>

            <div>
                <input type="text" id="lk" name="lk" placeholder="ארגון" class="input" tabindex="1"/>
                <input type="password" id="user_pass" name="user_pass" placeholder="משתמש" class="input" tabindex="2"/>
                <input type="password" id="password_pass" name="password_pass" placeholder="סיסמה" class="input" tabindex="3"/>
                <input type="submit" value="כניסה" tabindex="4"/>
            </div>

            <div id="formFooter">
                <a class="underlineHover" href="#">?שכחת סיסמה</a>
            </div>
        </div>

        <div class="container p-5 display-none">
            <div class="alert alert-primary text-center" role="alert">שגיאה בהתחברות</div>
        </div>
    </div>
</body>
</html>

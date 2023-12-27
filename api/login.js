import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method == "GET") {
    // Generate a CSRF token
    const csrfToken = generateToken(100);
    // console.log(req)

    const html = `<!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Login</title>
          <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" rel="stylesheet">
          <script src="https://unpkg.com/htmx.org@1.9.5"></script>
        </head>
        <body style="background-color: #f3f4f6">
          <div class="container mt-5">
            <div class="row justify-content-center">
              <div class="col-md-6">
                <div class="card shadow-sm" style="width: 360px; margin: 0 auto;">
                  <div class="card-body">
                    <h3 class="text-center">Login</h3>

                    <div id="result"></div>

                    <form hx-post="/api/login" hx-trigger="submit" hx-target="#result" hx-indicator="#spinner">
                        <div class="form-group">
                          <label class="mb-1" for="username">Username</label>
                          <input type="username" class="form-control mb-2" id="username" name="username">
                        </div>
                        <div class="form-group">
                          <label class="mb-1" for="password">Password</label>
                          <input type="password" class="form-control mb-2" id="password" name="password">
                        </div>
                        <input type="hidden" name="csrfToken" value="${csrfToken}">
                        <button type="submit" class="btn btn-dark w-100 mt-2">
                        <div class="row">
                        <div class="col-2"></div>
                        <div class="col-8 text-center">Submit</div>
                        
                        <div class="col-2 text-end">
                      <div id="spinner" class="spinner-border spinner-border-sm htmx-indicator" role="status">
                        <span class="visually-hidden">Loading...</span>
                      </div>
                      </div>
                      </div>
                      
                      </button>
                      </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        <script>
          document.body.addEventListener("keyup", (event) => {
          document.querySelector('#result').innerHTML = '';
          });
          
          document.body.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
            const submit_form = document.querySelector('#submit_form');
            submit_form.click();
            }
          });
        </script>
        </body>
        </html>
        `;

    if (process.env.MODE == "dev") {
      res.setHeader("Set-Cookie", `csrfToken=${csrfToken}; path=/;`);
    } else {
      res.setHeader(
        "Set-Cookie",
        `csrfToken=${csrfToken}; path=/; SameSite=Strict; HttpOnly;`
      );
    }

    res.status(200).send(html);
  } else {
    const { body } = req;

    const csrfTokenCookie = req.cookies.csrfToken;

    if (!body.csrfToken || body.csrfToken !== csrfTokenCookie) {
      responseError(res, "Invalid CSRF token");
      return;
    }

    // Input validation
    if (!body.username || !body.password) {
      responseError(res, "Username and password are required");
      return;
    }

    const username = body.username.trim().toLowerCase();
    const password = body.password.trim();

    // Get the username and password from environment variables
    const correctUsername = process.env.USERNAME;
    const correctPassword = process.env.PASSWORD;

    // Check if the posted username and password match the correct ones
    if (username === correctUsername && password === correctPassword) {
      // The username and password are correct
      const token = jwt.sign({ username }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      }); // replace '1h' with the desired token expiration time

      if (process.env.MODE == "dev") {
        res.setHeader("Set-Cookie", `token=${token}; path=/;`);
        res.setHeader("HX-Redirect", "/");
      } else {
        res.setHeader(
          "Set-Cookie",
          `token=${token}; path=/; SameSite=Strict; HttpOnly;`
        );
        res.setHeader("HX-Redirect", "/");
      }
      res.status(302).send("Logged in");
    } else {
      // The username or password is incorrect
      responseError(res, "Username or password incorrect");
      return;
    }
  }
}

function generateToken(length) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

function responseError(res, msg) {
  return res
    .status(200)
    .send(`<div class="alert alert-danger mb-2 mt-3 text-center">${msg}</div>`);
}

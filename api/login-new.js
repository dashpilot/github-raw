export const config = {
  runtime: "edge",
};

export default async function handler(req) {
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
    
                        <form hx-post="/api/login-new" hx-trigger="submit" hx-target="#result" hx-indicator="#spinner">
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

    /*
    if (process.env.MODE == "dev") {
      res.setHeader("Set-Cookie", `csrfToken=${csrfToken}; path=/;`);
    } else {
      res.setHeader(
        "Set-Cookie",
        `csrfToken=${csrfToken}; path=/; SameSite=Strict; HttpOnly;`
      );
    }
    */

    return new Response(html, {
      status: 200,
      headers: {
        "content-type": "text/html",
      },
    });

    // res.status(200).send(html);
  } else {
    const form = await req.formData();

    const username = form.get("username").trim().toLowerCase();
    const password = form.get("password").trim();

    // const csrfTokenCookie = req.cookies.csrfToken;

    /*
    if (!body.csrfToken || body.csrfToken !== csrfTokenCookie) {
      responseError(res, "Invalid CSRF token");
      return;
    }
    */

    // Input validation
    if (!username || !password) {
      return new Response(
        `<div class="alert alert-danger mt-3">Username and password are required.</div>`,
        {
          status: 200,
          headers: {
            "content-type": "text/html",
          },
        }
      );
    }

    return fetch("https://api.frontsome.net/auth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        password: password,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        // Store the JWT in a cookie
        // document.cookie = `token=${data.token}; path=/; Secure; HttpOnly; SameSite=Strict`;

        if (data.ok) {
          console.log(data.token);
          return new Response("", {
            status: 200,
            headers: {
              // "Set-Cookie": `token=${data.token}; path=/;`, //  HttpOnly; SameSite=Lax
              "set-cookie": `token=${data.token}; path=/; HttpOnly; SameSite=Lax`, //  HttpOnly; SameSite=Strict; Secure
              "HX-redirect": "/",
            },
          });
        } else {
          return new Response(
            `<div class="alert alert-danger mt-3">${data.error}</div>`,
            {
              status: 200,
              headers: {
                "content-type": "text/html",
              },
            }
          );
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        return new Response(
          `<div class="alert alert-danger mt-3">${error}</div>`,
          {
            status: 200,
            headers: {
              "content-type": "text/html",
            },
          }
        );
      });
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

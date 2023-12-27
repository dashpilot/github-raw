export default async function handler(req, res) {
  if (req.method == "GET") {
    res.setHeader("Set-Cookie", `token=; Max-Age=0; Path=/;`);
    res.redirect(302, "/");
  }
}

export default async function handler(req, res) {
  if (req.cookies.token) {
    if (req.method == "POST") {
      const { body } = req;

      // console.log(body);

      const mydata = body;
      fetch("https://api.frontsome.net/save", {
        method: "POST", // or 'PUT'
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${req.cookies.token}`,
        },
        body: JSON.stringify(mydata), // data can be `string`, `object`, `array` or any other data type
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.ok) {
            console.log("Success:", data);
            res.json({ ok: true, message: data.message });
          } else {
            res.json({ ok: false, error: data });
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          res.json({ ok: false, msg: error });
        });
    }
  } else {
    // The user is not logged in
    res.send(`You must be logged in to view this page.`);
  }
}

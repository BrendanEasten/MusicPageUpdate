import express from "express";
import axios from "axios";
import path from "path";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

const app = express();
const port = 3000;

// Serve static files
app.use(express.static(path.resolve("public")));

// Spotify login route
app.get("/login", (req, res) => {
  const clientId = process.env.CLIENT_ID;
  const redirectUri = "http://localhost:3000/callback";
  const scopes = "user-top-read playlist-modify-private";

  const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&scope=${encodeURIComponent(scopes)}`;
  res.redirect(authUrl);
});

// Callback route for exchanging authorization code for access token
// Spotify login route
app.get("/login", (req, res) => {
  const clientId = process.env.CLIENT_ID;
  const redirectUri = "http://localhost:3000/callback";
  const scopes = "user-top-read playlist-modify-private";

  const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&scope=${encodeURIComponent(scopes)}`;
  res.redirect(authUrl);
});

// Callback route for exchanging authorization code for access token
app.get("/callback", async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send("No code received");
  }

  const clientId = process.env.CLIENT_ID;
  const clientSecret = process.env.CLIENT_SECRET;
  const redirectUri = "http://localhost:3000/callback";

  const tokenUrl = "https://accounts.spotify.com/api/token";
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  try {
    const response = await axios.post(
      tokenUrl,
      new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      }).toString(),
      {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const { access_token } = response.data;
    // Redirect back to the home page or index
    res.redirect(`/home?access_token=${access_token}`);
  } catch (error) {
    console.error("Failed to authenticate with Spotify:", error);
    res.status(500).send("Failed to authenticate with Spotify");
  }
});

// Serve the home page
app.get("/home", (req, res) => {
  res.sendFile(path.resolve("public/index.html")); // Adjust the path to your HTML file
});

// Fetch user recommendations
app.get("/recommendations", async (req, res) => {
  const accessToken = req.query.access_token;

  if (!accessToken) {
    return res.status(400).send("Error: No access token provided");
  }

  try {
    const response = await axios.get("https://api.spotify.com/v1/me/top/tracks", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const tracks = response.data.items;
    res.json(
      tracks.map((track) => ({
        name: track.name,
        artists: track.artists.map((artist) => artist.name).join(", "),
        imageUrl: track.album.images.length ? track.album.images[0].url : "default_placeholder_image_url",
      }))
    );
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    res.status(500).send("Failed to fetch recommendations");
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
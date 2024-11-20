
// =========================== IMAGE SLIDESHOW =====================================================
// Slideshow only for images inside '.image-container' (not for the recommendation images)
let currentIndex = 0;
let images = document.querySelectorAll('.image-container .album-cover'); // Ensure targeting only slideshow images

// Function to update images (in case new ones are added dynamically)
function updateImages() {
  images = document.querySelectorAll('.image-container .album-cover');
}

// Function to handle the image transition
function changeImage() {
  // Remove the active class from the current image
  images[currentIndex].classList.remove('active');
  
  // Increment the index to point to the next image
  currentIndex = (currentIndex + 1) % images.length;

  // Add the active class to the next image
  images[currentIndex].classList.add('active');
}

// Start by showing the first image
images[currentIndex].classList.add('active');

// Change the image every 3 seconds (adjust as needed)
setInterval(() => {
  updateImages(); // Update the images list if new images are added
  changeImage(); // Change the image to the next one
}, 3000);

// =========================== LOGIN API =====================================================
// Function to initiate the Spotify login process
document.getElementById("loginButton").addEventListener("click", () => {
  const clientId = "5f8c85d5efee4c1cb9d33b705c430006"; // Replace with your Spotify app's client ID
  const redirectUri = "http://localhost:3000/callback"; // URL that Spotify will redirect to after login
  const scopes = "user-top-read playlist-modify-private"; // Define the required scopes

  // Construct the authorization URL
  const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&scope=${encodeURIComponent(scopes)}`;

  // Redirect the user to Spotify's login page
  window.location.href = authUrl;
});

// Extract the access token from the URL
function getAccessTokenFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("access_token");
}

// Fetch and display recommendations with preview
async function fetchRecommendations(accessToken) {
  try {
    const response = await fetch("https://api.spotify.com/v1/me/top/tracks", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch recommendations");
    }

    const data = await response.json();
    const container = document.getElementById("recommendationCards");
    container.innerHTML = ""; // Clear any existing content

    // Generate recommendation cards
    data.items.forEach((track) => {
      const card = document.createElement("div");
      card.className = "recommendation-card";

      // Populate the card with track details, including preview audio
      card.innerHTML = `
        <img src="${track.album.images[0]?.url}" alt="Album Cover" class="album-cover">
        <h3>${track.name}</h3>
        <p>${track.artists.map((artist) => artist.name).join(", ")}</p>
        ${track.preview_url ? `<audio controls>
          <source src="${track.preview_url}" type="audio/mpeg">
          Your browser does not support the audio element.
        </audio>` : `<p>No preview available</p>`}
      `;

      container.appendChild(card);
    });
  } catch (error) {
    console.error("Error fetching recommendations:", error);
  }
}
// On page load
window.onload = () => {
  const accessToken = getAccessTokenFromUrl();

  if (accessToken) {
    // Save token in session storage
    sessionStorage.setItem("spotifyAccessToken", accessToken);

    // Fetch and display recommendations
    fetchRecommendations(accessToken);
  } else {
    // Check for token in session storage
    const storedToken = sessionStorage.getItem("spotifyAccessToken");
    if (storedToken) {
      fetchRecommendations(storedToken);
    }
  }
};

// =========================== NAV LINK HIGHLIGHT ===========================================
// Add 'active' class to the current navigation link
document.addEventListener('DOMContentLoaded', () => {
  // Get the current page URL
  const currentPage = window.location.pathname.split("/").pop();

  // Get all the nav links
  const navLinks = document.querySelectorAll('.nav-link');

  // Loop through all the nav links and check if the href exactly matches the current page
  navLinks.forEach(link => {
    // Extract the page name from the link href (use split to get the filename)
    const linkPage = link.getAttribute('href').split("/").pop();

    // If the link href exactly matches the current page, add the active class
    if (currentPage === linkPage) {
      link.classList.add('active');
    }
  });
});

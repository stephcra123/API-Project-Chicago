//get a random number between 1 and size
function getNewImageNum(size = 10000) {
  return Math.round(Math.random() * size);
}

//needs to be global as id is used in both the reload and update display function to ensure artist data matches artist
let currentArtworkData = null;

//use async so that the loops don't overlap when there is a error
async function reloadInfo(rand_image, searchTerm, retryCount = 0) {
  const searchParam = searchTerm ? encodeURIComponent(searchTerm) : '';
  
  try {
    const response = await fetch(`https://api.artic.edu/api/v1/artworks/search?&q=${searchParam}&fields=image_id,title,description,id&limit=1&page=${rand_image}&has_image=true`);

    if (!response.ok) {
//403 errors due to page number being to high when using search,
//  loop with smaller range, 
//  retry 5 will always be 0 and should be successful return an image
      if (response.status === 403 && retryCount < 5) {
        console.log("403 error loop");
        console.log(retryCount);
        const newRandImage = getNewImageNum(Math.max(Math.floor(10000 / ((10)**retryCount)), 1));
        return reloadInfo(newRandImage, searchTerm, retryCount + 1);
      }
      throw new Error('Request failed');
    }
    
    const data = await response.json();
    
    
    const artworks = data.data;
    // occationally the data for a id is empty
    if (!artworks || artworks.length === 0) {
      if (retryCount < 6) {
        console.log(retryCount)
        const newRandImage = getNewImageNum(Math.max(Math.floor(10000 / ((10)**retryCount)), 1));
        return reloadInfo(newRandImage, searchTerm, retryCount + 1);
      } else {
        throw new Error('No artwork found after multiple attempts');
      }
    }

    currentArtworkData = artworks[0];
//gets and sets image source
    document.getElementById('image').src = `https://www.artic.edu/iiif/2/${currentArtworkData.image_id}/full/843,/0/default.jpg`;
// Always use artwork display on inital load and when getting new art via search button
    updateDisplay('artwork'); 
    return currentArtworkData;
    
  } catch (error) {
    console.error('Error fetching data:', error);
    document.getElementById('data-container').innerHTML = "<p>Error loading data. Please try again.</p>";
  }
}

function updateDisplay(view = 'artwork') {
  const art_titles = document.getElementById('art_title');
  const descriptions = document.getElementById('descript');
  const toggleLabel = document.getElementById('info-toggle');

  if (view === 'artist') {
    //get artist inf0 when navigating to the artist tab
    //dosen't need the same loop error handling as we already proved out that artwork had data
    toggleLabel.textContent = 'Showing Artist Detail';
    fetch(`https://api.artic.edu/api/v1/artworks/${currentArtworkData.id}?fields=artist_title,artist_display`)
      .then(response => response.json())
      .then(data => {
        const artistData = data.data;
        art_titles.textContent = artistData.artist_title || 'Unknown Artist';
        descriptions.innerHTML = artistData.artist_display || "<p>No artist information available</p>";
      })
      .catch(error => {
        console.error('Error fetching artist info:', error);
        art_titles.textContent = 'Unknown Artist';
        descriptions.innerHTML = "<p>No artist information available</p>";
      });
  } else {
    //use data from reload function
    //also used to set back to default when loading new artwork
    toggleLabel.textContent = 'Showing Artwork Detail';
    art_titles.textContent = currentArtworkData.title || "Unknown Title";
    descriptions.innerHTML = currentArtworkData.description || "<p>No Description Available</p>";
  }
}

document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('learn-form');
  //get new artwork listner
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const searchTerm = document.getElementById('search-term').value;
    const rand_image = getNewImageNum();
    reloadInfo(rand_image, searchTerm);
  });
//artist navigation
  document.getElementById('artist-btn').addEventListener('click', () => {
    if (currentArtworkData) updateDisplay('artist');
  });
//artwork navigation
  document.getElementById('artwork-btn').addEventListener('click', () => {
    if (currentArtworkData) updateDisplay('artwork');
  });

// Load initial artwork
  reloadInfo(getNewImageNum(), '');
});

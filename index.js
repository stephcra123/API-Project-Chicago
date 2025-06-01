function getNewImageNum(size = 10000) {
  let artwork_num = Math.round(Math.random() * size);
  return artwork_num;
}

let currentArtworkData = null;

function reloadInfo(rand_image, searchTerm, retryCount = 0) {
  const searchParam = searchTerm ? `${encodeURIComponent(searchTerm)}` : '';
  return fetch(`https://api.artic.edu/api/v1/artworks/search?&q=${searchParam}&fields=image_id,title,description,id&limit=1&page=${rand_image}&has_image=true`)
    .then(response => {
      if (!response.ok) {
        if (response.status === 403 && retryCount < 5) {
          const newRandImage = getNewImageNum(size = (10000 / ((retryCount + 1) * 10)));
          console.log(retryCount);
          return reloadInfo(newRandImage, searchTerm, retryCount + 1);
        }
        throw new Error('Request failed');
      }
      return response.json();
    })
    .then(data => {
      const artworks = data.data;
      if (!artworks || artworks.length === 0) {
        if (retryCount < 5) {
          const newRandImage = getNewImageNum(size = (10000 / ((retryCount + 1) * 10)));
          return reloadInfo(newRandImage, searchTerm, retryCount + 1);
        } else {
          throw new Error('No artwork found after multiple attempts');
        }
      }

      const artworkData = artworks[0];
      currentArtworkData = artworkData;
      const image = document.getElementById('image');
      image.src = `https://www.artic.edu/iiif/2/${artworkData.image_id}/full/843,/0/default.jpg`;
      
      updateDisplay();

      return data;
    })
    .catch(error => {
      console.error('Error fetching data:', error);
      document.getElementById('data-container').innerHTML = "<p>Error loading data. Please try again.</p>";
    });
}

function updateDisplay() {

  const toggle = document.getElementById('toggle-detail-checkbox'); 
  const art_titles = document.getElementById('art_title');
  const descriptions = document.getElementById('descript');
    
  if (toggle.checked) {
    console.log('Fetching artist info for ID:', currentArtworkData.id);
    fetch(`https://api.artic.edu/api/v1/artworks/${currentArtworkData.id}?fields=artist_title,artist_display`)
      .then(response => response.json())
      .then(data => {
        const artistData = data.data;
        art_titles.textContent = artistData.artist_title || 'Unknown Artist';
        descriptions.innerHTML = artistData.artist_display || "<p>No artist information available</p>"
      })
      .catch(error => {
        console.error('Error fetching artist info:', error);
        art_titles.textContent = 'Unknown Artist';
        descriptions.innerHTML = "<p>No artist information available</p>";
      });
  } else {
    art_titles.textContent = currentArtworkData.title || "Unknown Title";
    descriptions.innerHTML = currentArtworkData.description || "<p>No Description Available</p>"
  }
}

document.addEventListener('DOMContentLoaded', function () {
  
  // Toggle listener
  const toggle = document.getElementById('toggle-detail-checkbox'); 
  const toggleLabel = document.getElementById('info-toggle');

  toggle.addEventListener('change', function () {
      toggleLabel.textContent = toggle.checked ? 'Showing Artist Detail' : 'Showing Artwork Detail';     
      updateDisplay();
    });
    
  
  // Form event listener
  const form = document.getElementById('learn-form');
  form.addEventListener('submit', function (e) {
      e.preventDefault();
      // Reset toggle to reset to art view and so that it dosent preform the second fetch 
      const toggle = document.getElementById('toggle-detail-checkbox');
      const toggleLabel = document.getElementById('info-toggle');
      toggle.checked = false;
      toggleLabel.textContent = 'Showing Artwork Detail';
      
      //Set search and reload
      const searchTerm = document.getElementById('search-term').value;
      rand_image = getNewImageNum();
      reloadInfo(rand_image, searchTerm);
      console.log(rand_image);
    });

  // Load initial artwork
  console.log('Loading initial artwork');
  rand_image = getNewImageNum();
  reloadInfo(rand_image, '');
});
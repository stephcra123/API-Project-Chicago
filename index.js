

const artwork_num = Math.round(Math.random()*100000/12) // get a page number
document.addEventListener('DOMContentLoaded', function() {
fetch(`https://api.artic.edu/api/v1/artworks/?fields=image_id,title,artist,artist_display,description,id&limit=1&page=${artwork_num}&has_image=true`) 
.then(response => {
    if (!response.ok) {
      throw new Error('Request failed');  
    }
    //console.log(response.json())
    return response.json(); // Parse the response as JSON
    
  })
  .then(data => {
    const artworks = data.data;
    const image = document.getElementById('image')
    const art_titles = document.getElementById('art_title')
    const artworkData = artworks[0];
    const artwork = document.createElement('li');
    //title
    art_titles.textContent = artworkData.title;
    console.log(art_titles)
    //image
    artwork.image_id = artworkData.image_id;
    artwork.imageUrl = `https://www.artic.edu/iiif/2/${artworkData.image_id}/full/843,/0/default.jpg`;
    image.src = artwork.imageUrl
    console.log(image)

    return artwork
  })
  .catch(error => {
    console.error('Error fetching data:', error);
    document.getElementById('data-container').innerHTML = "<p>Error loading data. Please try again.</p>";
  });
});
console.log('Image element found:', image);
console.log('Image element type:', typeof image);

fetch(`https://api.artic.edu/api/v1/artworks/?fields=description&limit=1&page=${artwork_num}&has_image=true`) 
.then(response => {
    if (!response.ok) {
      throw new Error('Request failed');  
    }
    //console.log(response.json())
    return response.json(); // Parse the response as JSON
    
  })
  .then(data => {
    const artworks = data.data;
    const artworkData = artworks[0];
    const descriptions = document.getElementById('descript')
    descriptions.textContent = artworkData.description
    console.log(artworkData.description)
    console.log(descriptions.textContent)
  

    return artworks
  })
  .catch(error => {
    console.error('Error fetching data:', error);
    document.getElementById('data-container').innerHTML = "<p>Error loading data. Please try again.</p>";
  });
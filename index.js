

const artwork_num = Math.round(Math.random()*100000/12) // get a page number
document.addEventListener('DOMContentLoaded', function() {
fetch(`https://api.artic.edu/api/v1/artworks/?fields=title,artist,artist_display,description,id&limit=12&page=${artwork_num}`) 
.then(response => {
    if (!response.ok) {
      throw new Error('Request failed');  
    }
    //console.log(response.json())
    return response.json(); // Parse the response as JSON
    
  })
  .then(data => {
    const artworks = data.data;
    console.log('number of peices: ',artworks.length)
    const artSection = document.getElementById('data-container');
    const artList = artSection.querySelector('ul');
  
    for (let i = 0; i < artworks.length; i++) {
      const artwork = document.createElement('li');
      artwork.textContent = artworks[i].title;
      console.log(i)
      //artwork.className = 'projects-item'; // Add class for styling
      artList.appendChild(artwork);
    }
      return artworks
    })
  .catch(error => {
    console.error('Error fetching data:', error);
    document.getElementById('data-container').innerHTML = "<p>Error loading data. Please try again.</p>";
  });
});
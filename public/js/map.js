const newCordinates = [cordinates[1] , cordinates[0]];
  const map = L.map('map').setView(newCordinates, 13);

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        // Add marker
        L.marker(newCordinates)
            .addTo(map)
            .bindPopup(locationFinal)
            .openPopup();

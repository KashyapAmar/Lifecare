document.addEventListener('DOMContentLoaded', function() {
    // Price range display
    const priceRange = document.getElementById('price-range');
    const priceValue = document.getElementById('price-value');
    
    priceRange.addEventListener('input', function() {
        priceValue.textContent = `₹${this.value.toLocaleString()}/month`;
    });

    // View toggle (List/Map)
    const viewBtns = document.querySelectorAll('.view-btn');
    const listView = document.getElementById('list-view');
    const mapView = document.getElementById('map-view');
    
    viewBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            viewBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            if (this.dataset.view === 'list') {
                listView.style.display = 'grid';
                mapView.style.display = 'none';
            } else {
                listView.style.display = 'none';
                mapView.style.display = 'block';
                // In a real app, you would initialize a map here
            }
        });
    });

    // Search functionality
    const searchBtn = document.getElementById('search-btn');
    
    searchBtn.addEventListener('click', function() {
        const city = document.getElementById('city-select').value;
        const university = document.getElementById('university-select').value;
        const type = document.getElementById('type-select').value;
        const price = priceRange.value;
        
        // In a real app, this would filter accommodations
        console.log('Searching for:', {city, university, type, price});
        alert('In a real application, this would filter accommodation listings');
    });

    // Contact button handlers
    document.querySelectorAll('.contact-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            alert('Contact form would open here');
        });
    });

    // Details button handlers
    document.querySelectorAll('.details-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            alert('Detailed accommodation page would open here');
        });
    });
});
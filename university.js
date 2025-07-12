// University data (would typically come from an API or JSON file)
const universities = [
    {
        name: "Indian Institute of Technology Bombay",
        state: "Maharashtra",
        city: "Mumbai",
        type: "IIT",
        established: 1958,
        nirfRank: 3,
        naacGrade: "A++",
        website: "https://www.iitb.ac.in/",
        description: "Premier engineering and technology institute in India, known for its rigorous academic programs and research output."
    },
    {
        name: "Indian Institute of Technology Delhi",
        state: "Delhi",
        city: "New Delhi",
        type: "IIT",
        established: 1961,
        nirfRank: 2,
        naacGrade: "A++",
        website: "https://home.iitd.ac.in/",
        description: "One of the top engineering institutes in India with strong industry connections and research facilities."
    },
    // Add more universities with additional details...
];

// DOM Elements
const stateSelect = document.getElementById('state-select');
const typeSelect = document.getElementById('type-select');
const naacSelect = document.getElementById('naac-select');
const sortSelect = document.getElementById('sort-select');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const universitiesContainer = document.getElementById('universities-container');
const gridContainer = document.getElementById('grid-container');
const listViewBtn = document.getElementById('list-view-btn');
const gridViewBtn = document.getElementById('grid-view-btn');
const exportBtn = document.getElementById('export-btn');
const favoritesBtn = document.getElementById('favorites-btn');
const totalCountElement = document.getElementById('total-count');
const topRatedCountElement = document.getElementById('top-rated-count');
const statesCountElement = document.getElementById('states-count');
const favoritesCountElement = document.getElementById('favorites-count');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const pageInfoElement = document.getElementById('page-info');
const listView = document.getElementById('list-view');
const gridView = document.getElementById('grid-view');

// App State
let currentView = 'list';
let currentPage = 1;
const itemsPerPage = 10;
let favorites = JSON.parse(localStorage.getItem('universityFavorites')) || [];

// Initialize the page
function init() {
    populateStateFilter();
    renderUniversities(universities);
    updateStats();
    updateFavoritesCount();
    
    // Set up event listeners
    stateSelect.addEventListener('change', filterAndRender);
    typeSelect.addEventListener('change', filterAndRender);
    naacSelect.addEventListener('change', filterAndRender);
    sortSelect.addEventListener('change', filterAndRender);
    searchBtn.addEventListener('click', filterAndRender);
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') filterAndRender();
    });
    
    listViewBtn.addEventListener('click', () => switchView('list'));
    gridViewBtn.addEventListener('click', () => switchView('grid'));
    exportBtn.addEventListener('click', exportData);
    favoritesBtn.addEventListener('click', showFavorites);
    prevPageBtn.addEventListener('click', prevPage);
    nextPageBtn.addEventListener('click', nextPage);
    
    // Load initial view
    switchView('list');
}

// Populate state filter dropdown
function populateStateFilter() {
    const states = [...new Set(universities.map(uni => uni.state))].sort();
    
    states.forEach(state => {
        const option = document.createElement('option');
        option.value = state;
        option.textContent = state;
        stateSelect.appendChild(option);
    });
}

// Filter, sort and render universities
function filterAndRender() {
    const filtered = filterUniversities();
    const sorted = sortUniversities(filtered);
    renderUniversities(sorted);
    updateStats(sorted);
    currentPage = 1; // Reset to first page on new filter
    updatePagination(sorted.length);
}

// Filter universities based on selected criteria
function filterUniversities() {
    const selectedState = stateSelect.value;
    const selectedType = typeSelect.value;
    const selectedNaac = naacSelect.value;
    const searchTerm = searchInput.value.toLowerCase();
    
    let filtered = universities;
    
    if (selectedState !== 'all') {
        filtered = filtered.filter(uni => uni.state === selectedState);
    }
    
    if (selectedType !== 'all') {
        filtered = filtered.filter(uni => uni.type === selectedType);
    }
    
    if (selectedNaac !== 'all') {
        filtered = filtered.filter(uni => uni.naacGrade === selectedNaac);
    }
    
    if (searchTerm) {
        filtered = filtered.filter(uni => 
            uni.name.toLowerCase().includes(searchTerm) || 
            uni.city.toLowerCase().includes(searchTerm) ||
            (uni.description && uni.description.toLowerCase().includes(searchTerm))
        );
    }
    
    return filtered;
}

// Sort universities
function sortUniversities(unis) {
    const sortValue = sortSelect.value;
    const sorted = [...unis];
    
    switch(sortValue) {
        case 'name-asc':
            return sorted.sort((a, b) => a.name.localeCompare(b.name));
        case 'name-desc':
            return sorted.sort((a, b) => b.name.localeCompare(a.name));
        case 'rank-asc':
            return sorted.sort((a, b) => (a.nirfRank || Infinity) - (b.nirfRank || Infinity));
        case 'rank-desc':
            return sorted.sort((a, b) => (b.nirfRank || 0) - (a.nirfRank || 0));
        case 'established-asc':
            return sorted.sort((a, b) => a.established - b.established);
        case 'established-desc':
            return sorted.sort((a, b) => b.established - a.established);
        default:
            return sorted;
    }
}

// Render universities based on current view
function renderUniversities(unis) {
    const paginated = paginate(unis);
    
    if (currentView === 'list') {
        renderListView(paginated);
    } else {
        renderGridView(paginated);
    }
    
    updatePagination(unis.length);
}

// Render list view
function renderListView(unis) {
    universitiesContainer.innerHTML = '';
    
    if (unis.length === 0) {
        universitiesContainer.innerHTML = `
            <div class="no-results">
                <i class="fas fa-university"></i>
                <h3>No universities found</h3>
                <p>Try adjusting your filters or search term</p>
            </div>
        `;
        return;
    }
    
    unis.forEach(uni => {
        const uniElement = document.createElement('div');
        uniElement.className = 'university-item';
        const isFavorite = favorites.includes(uni.name);
        
        uniElement.innerHTML = `
            <div class="name"><a href="${uni.website}" target="_blank">${uni.name}</a></div>
            <div class="location">${uni.city}, ${uni.state}</div>
            <div class="type">${uni.type}</div>
            <div class="ranking">${uni.nirfRank ? `#${uni.nirfRank}` : 'N/A'}</div>
            <div class="naac ${getNaacClass(uni.naacGrade)}">${uni.naacGrade || 'N/A'}</div>
            <div class="actions">
                <button class="action-btn favorite ${isFavorite ? 'active' : ''}" data-name="${uni.name}">
                    <i class="fas fa-heart"></i>
                </button>
            </div>
        `;
        
        universitiesContainer.appendChild(uniElement);
    });
    
    // Add event listeners to favorite buttons
    document.querySelectorAll('.action-btn.favorite').forEach(btn => {
        btn.addEventListener('click', toggleFavorite);
    });
}

// Render grid view
function renderGridView(unis) {
    gridContainer.innerHTML = '';
    
    if (unis.length === 0) {
        gridContainer.innerHTML = `
            <div class="no-results">
                <i class="fas fa-university"></i>
                <h3>No universities found</h3>
                <p>Try adjusting your filters or search term</p>
            </div>
        `;
        return;
    }
    
    unis.forEach(uni => {
        const isFavorite = favorites.includes(uni.name);
        const card = document.createElement('div');
        card.className = 'university-card';
        
        card.innerHTML = `
            <div class="card-header">
                <h3>${uni.name}</h3>
                <div class="type">${uni.type}</div>
                <button class="favorite-btn ${isFavorite ? 'active' : ''}" data-name="${uni.name}">
                    <i class="fas fa-heart"></i>
                </button>
            </div>
            <div class="card-body">
                <div class="card-row">
                    <span class="card-label">Location:</span>
                    <span class="card-value">${uni.city}, ${uni.state}</span>
                </div>
                <div class="card-row">
                    <span class="card-label">Established:</span>
                    <span class="card-value">${uni.established}</span>
                </div>
                <div class="card-row">
                    <span class="card-label">NIRF Rank:</span>
                    <span class="card-value">${uni.nirfRank ? `#${uni.nirfRank}` : 'N/A'}</span>
                </div>
                <div class="card-row">
                    <span class="card-label">NAAC Grade:</span>
                    <span class="card-value naac-badge ${getNaacClass(uni.naacGrade)}">${uni.naacGrade || 'N/A'}</span>
                </div>
                ${uni.description ? `<p class="description">${uni.description}</p>` : ''}
                <div class="card-actions">
                    <a href="${uni.website}" target="_blank">Visit Website</a>
                    <button class="action-btn" data-name="${uni.name}">More Info</button>
                </div>
            </div>
        `;
        
        gridContainer.appendChild(card);
    });
    
    // Add event listeners to favorite buttons
    document.querySelectorAll('.favorite-btn').forEach(btn => {
        btn.addEventListener('click', toggleFavorite);
    });
}

// Helper function to get NAAC grade CSS class
function getNaacClass(grade) {
    if (!grade) return '';
    
    switch(grade) {
        case 'A++': return 'Aplusplus';
        case 'A+': return 'Aplus';
        case 'A': return 'A';
        case 'B++': return 'Bplusplus';
        case 'B+': return 'Bplus';
        default: return '';
    }
}

// Toggle university favorite status
function toggleFavorite(e) {
    const uniName = e.currentTarget.getAttribute('data-name');
    const index = favorites.indexOf(uniName);
    
    if (index === -1) {
        favorites.push(uniName);
    } else {
        favorites.splice(index, 1);
    }
    
    // Update localStorage
    localStorage.setItem('universityFavorites', JSON.stringify(favorites));
    updateFavoritesCount();
    
    // Update button appearance
    e.currentTarget.classList.toggle('active');
    
    // If in favorites view, refresh the display
    if (favoritesBtn.classList.contains('active')) {
        showFavorites();
    }
}

// Show only favorited universities
function showFavorites() {
    favoritesBtn.classList.toggle('active');
    
    if (favoritesBtn.classList.contains('active')) {
        const filtered = universities.filter(uni => favorites.includes(uni.name));
        renderUniversities(filtered);
        updateStats(filtered);
    } else {
        filterAndRender();
    }
}

// Update statistics
function updateStats(filteredUnis = universities) {
    totalCountElement.textContent = filteredUnis.length;
    
    // Count top-rated institutions (A++ and A+)
    const topRatedCount = filteredUnis.filter(uni => 
        uni.naacGrade === 'A++' || uni.naacGrade === 'A+'
    ).length;
    topRatedCountElement.textContent = topRatedCount;
    
    // Count unique states represented
    const uniqueStates = new Set(filteredUnis.map(uni => uni.state));
    statesCountElement.textContent = uniqueStates.size;
}

// Update favorites count
function updateFavoritesCount() {
    favoritesCountElement.textContent = favorites.length;
}

// Switch between list and grid view
function switchView(view) {
    currentView = view;
    
    if (view === 'list') {
        listView.style.display = 'block';
        gridView.style.display = 'none';
        listViewBtn.classList.add('active');
        gridViewBtn.classList.remove('active');
    } else {
        listView.style.display = 'none';
        gridView.style.display = 'block';
        listViewBtn.classList.remove('active');
        gridViewBtn.classList.add('active');
    }
    
    filterAndRender();
}

// Pagination functions
function paginate(items) {
    const start = (currentPage - 1) * itemsPerPage;
    return items.slice(start, start + itemsPerPage);
}

function updatePagination(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    pageInfoElement.textContent = `Page ${currentPage} of ${totalPages}`;
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
}

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        filterAndRender();
    }
}

function nextPage() {
    const filtered = filterUniversities();
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    
    if (currentPage < totalPages) {
        currentPage++;
        filterAndRender();
    }
}

// Export data as CSV
function exportData() {
    const filtered = filterUniversities();
    const sorted = sortUniversities(filtered);
    
    if (sorted.length === 0) {
        alert('No data to export!');
        return;
    }
    
    // Create CSV content
    let csv = 'Name,State,City,Type,Established,NIRF Rank,NAAC Grade,Website\n';
    
    sorted.forEach(uni => {
        csv += `"${uni.name}","${uni.state}","${uni.city}","${uni.type}",${uni.established},${uni.nirfRank || ''},"${uni.naacGrade || ''}","${uni.website}"\n`;
    });
    
    // Create download link
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'universities.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Initialize the application
document.addEventListener('DOMContentLoaded', init);
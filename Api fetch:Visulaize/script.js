const apiUrl = "https://jsonplaceholder.typicode.com/posts";
const tableBody = document.querySelector("#data-table tbody");
const searchInput = document.querySelector("#search");
const sortSelect = document.querySelector("#sort");

// Fetch and render data
let posts = [];
fetch(apiUrl)
  .then(response => response.json())
  .then(data => {
    posts = data;
    renderTable(posts);
  })
  .catch(error => console.error("Error fetching data:", error));

// Render table
function renderTable(data) {
  tableBody.innerHTML = data.map(post => `
    <tr>
      <td>${post.id}</td>
      <td>${post.title}</td>
      <td>${post.body}</td>
    </tr>
  `).join("");
}

// Search functionality
searchInput.addEventListener("input", () => {
  const query = searchInput.value.toLowerCase();
  const filteredData = posts.filter(post => post.title.toLowerCase().includes(query));
  renderTable(filteredData);
});

// Sort functionality
sortSelect.addEventListener("change", () => {
  const sortOrder = sortSelect.value;
  const sortedData = [...posts].sort((a, b) => {
    return sortOrder === "asc" ? a.id - b.id : b.id - a.id;
  });
  renderTable(sortedData);
});

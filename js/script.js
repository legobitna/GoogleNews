let pageNum = 1;
let newsArticles = [];
let selectedSourceNames = [];
let selectedCategoryNames = null;
let sourceNames = {};
let categories = ['All', 'Business', 'Entertainment', 'General', 'Health', 'Science','Sports', 'Technology'];

function stripHtml(html) {
    let tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
}

const addScript = language => {
    let s = document.createElement("script");
    s.setAttribute(
        "src",
        `https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.24.0/locale/${language}.js`
    );
    document.body.appendChild(s);
};

if (window.clientInformation.language == "vi") {
    addScript("vi");
}

// async function fetchSources() {
//     let response = await fetch('https://newsapi.org/v2/sources?apiKey=c8920a6401f9458eae1a7af498f324c4');
//     let data = await response.json();
//     data.sources > 0 ? sourceNames = data.sources : console.log('There is no source fetched');
// }

async function fetchNews(category) {
    let url = `https://newsapi.org/v2/top-headlines?country=us&category=${category == null ? 'general' : category}&apiKey=c8920a6401f9458eae1a7af498f324c4&page=${pageNum}`
    console.log(url);
    let response = await fetch(url);
    let data = await response.json();
    newsArticles = data.articles;
    console.log(newsArticles);
    selectedSourceNames = [];
    renderNews(newsArticles);
    filterSources(newsArticles);
    pageNum++;
}

async function fetchMoreNews(category) {
    let url = `https://newsapi.org/v2/top-headlines?country=us&category=${category == null ? 'general' : category}&apiKey=c8920a6401f9458eae1a7af498f324c4&page=${pageNum}`
    console.log(url);
    let response = await fetch(url);
    let data = await response.json();
    newsArticles = newsArticles.concat(data.articles);
    console.log(newsArticles);
    selectedSourceNames = [];
    renderNews(newsArticles);
    filterSources(newsArticles);
    pageNum++;
}

function renderNews(articles) {
    let filteredArticles = articles.slice();
    document.getElementById("renderNewsArea").innerHTML = "";
    if (selectedSourceNames.length > 0) {
        console.log("pass throughs electedSourceNames.length > 0")
        filteredArticles = articles.filter(article => selectedSourceNames.includes(article.source.name) && article)
        console.log("this is filteredArticles 1", filteredArticles)
    }
    console.log('this is filtered Articles', filteredArticles);
    const html = filteredArticles.map(article => {
        return `
        <div class="card card-shadow p-2 ml-1 mr-0 row mb-3 d-flex flex-row container-fluid">
            <div class="col-12 col-md-3 mr-0 mr-md-4 card-img-left p-0">
                <img width="280" height="180" class="newsThumbnail rounded mx-auto d-block img-fluid" alt="News Thumbnail" src="${article.urlToImage || 'https://aliceasmartialarts.com/wp-content/uploads/2017/04/default-image.jpg'}" draggable="false"></a>
            </div>
            <div class="col-12 col-md-8"> 
                <div class="row text-left">
                    <a class="text-info newsCategory mb-1" href="${stripHtml(article.url == null ? "#" : article.url)}">${stripHtml(article.source.name == null ? " " : article.source.name)}</a>
                </div>
                <div class="row text-left">
                    <p class="h5 text-info card-title mb-2 p-0 newsTitle text-bold"><a href="${stripHtml(article.url == null ? "#" : article.url)}">${stripHtml(article.title == null ? "Untitled" : article.title)}</a></p>
                    <p class="card-text newsDescripttion"><a href="${stripHtml(article.url == null ? "#" : article.url)}">${stripHtml(article.description == null ? " " : article.description)}</a></p>
                </div>
                <div class="row inline-block">
                    <small class="newsDate align-bottom">${moment(article.publishedAt == null ? " " : article.publishedAt).fromNow()}</small>
                </div>
            </div>
        </div>
        `
    }).join('');
    document.getElementById("renderNewsArea").innerHTML = html;
    renderArticleCount(filteredArticles);
}

const filterSources = (articles) => {
    articles.map(a => {
        let source = a.source.name;
        if(sourceNames[source] == null){
            sourceNames[source] = 0;
        };
        sourceNames[source]++;
    })
    displaySources();
}

const displaySources = () => {
    let arr = Object.keys(sourceNames);
    const html = arr.map((sourceName, i) => {
        return `
        <li class="list-group-item list-group-item-action pl-1 pl-sm-5"><input type="checkbox" class="form-check-input" id="${sourceName}" onchange="renderNewsBySource(${i})"><label for="${sourceName}">${sourceName.split('.')[0]} : ${sourceNames[sourceName]}</label></li>
        `
    }).join('');
    document.getElementById("Sources").innerHTML = html;
}

const renderNewsBySource = (idx) => {
    let checkbox;
    let arr = Object.keys(sourceNames);
    checkbox = document.getElementById(arr[idx]);
    if (checkbox.checked){
        sortBy = "source";
        selectedSourceNames.push(arr[idx]);
        checkbox.parentElement.classList.add("active");
        // console.log('checkbox has been checked, running renderNews now, selectedSourceNames is: ', selectedSourceNames);
        renderNews(newsArticles);
    } else {
        selectedSourceNames.map((val,i) => arr[idx] == val && selectedSourceNames.splice(i,1));
        checkbox.parentElement.classList.remove("active");
        // console.log("checkbox id:", idx," has been unchecked, selectedSourceNames now is: ", selectedSourceNames);
        renderNews(newsArticles);
    }
}


const renderArticleCount = (articles) => {
    document.getElementById("numberOfArticles").innerHTML = `${articles.length} of ${newsArticles.length}`;
}

const generateCategoryDropdown = (categories) => {
    let html = categories.map(cat => {
        return `
        <button class="dropdown-item btn-outline-secondary ${cat == 'All' && 'active'}" type="button" onclick="handleCategoryDropdown('${cat}')">${cat}</button>\n
        `
    }).join('');
    document.getElementById('categoryDropdown').innerHTML = html;
}

const handleCategoryDropdown = (cat) => {
    console.log('dropdown selected: ', cat);
    selectedSourceNames = [];
    fetchNews(cat.toLowerCase());
}

generateCategoryDropdown(categories);
fetchNews();
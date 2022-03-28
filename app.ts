const root = document.getElementById("root");

let currPage = 1;
let newsFeed = [];

//Ajax 호출 함수
const Ajax = (URL) => {
  const XHR = new XMLHttpRequest();

  XHR.open("GET", URL, false);
  XHR.send();

  const data = JSON.parse(XHR.response);

  return data;
};

function makeFeeds(feeds) {
  for (let i = 0; i < feeds.length; i++) {
    feeds[i].read = false;
  }

  return feeds;
}

// 뉴스 리스트 보여주는 함수
const newsLists = () => {
  const newsURL = `https://api.hnpwa.com/v0/news/${currPage}.json`;

  if (newsFeed.length === 0) {
    newsFeed = makeFeeds(Ajax(newsURL));
  }

  let template = `
  <div class="bg-gray-600 min-h-screen">
    <div class="bg-white text-xl">
      <div class="mx-auto px-4">
        <div class="flex justify-between items-center py-6">
          <div class="flex justify-start">
            <h1 class="font-extrabold">Hacker News</h1>
          </div>
          <div class="items-center justify-end">
            <a href="#/page/{{__prev_page__}}" class="text-gray-500">
              Previous
            </a>
            <a href="#/page/{{__next_page__}}" class="text-gray-500 ml-4">
              Next
            </a>
          </div>
        </div> 
      </div>
    </div>
    <div class="p-4 text-2xl text-gray-700">
      {{__news_feed__}}        
    </div>
  </div>
`;

  const newsList = [];
  for (let i = 0; i < 10; i++) {
    newsList.push(`
    <div class="p-6 ${
      newsFeed[i].read ? "bg-red-500" : "bg-white"
    } mt-6 rounded-lg shadow-md transition-colors duration-500 hover:bg-green-100">
    <div class="flex">
      <div class="flex-auto">
        <a href="#/show/${newsFeed[i].id}">${newsFeed[i].title}</a>  
      </div>
      <div class="text-center text-sm">
        <div class="w-10 text-white bg-green-300 rounded-lg px-0 py-2">${
          newsFeed[i].comments_count
        }</div>
      </div>
    </div>
    <div class="flex mt-3">
      <div class="grid grid-cols-3 text-sm text-gray-500">
        <div><i class="fas fa-user mr-1"></i>${newsFeed[i].user}</div>
        <div><i class="fas fa-heart mr-1"></i>${newsFeed[i].points}</div>
        <div><i class="far fa-clock mr-1"></i>${newsFeed[i].time_ago}</div>
      </div>  
    </div>
  </div>   
  `);
  }

  template = template.replace("{{__news_feed__}}", newsList.join(""));
  template = template.replace(
    "{{__prev_page__}}",
    currPage > 1 ? currPage - 1 : 1
  );
  template = template.replace(
    "{{__next_page__}}",
    currPage === 10 ? 10 : currPage + 1
  );

  root.innerHTML = template;
};

// 뉴스 내용 보여주는 함수
const newsDetail = () => {
  root.innerHTML = "";
  const id = location.hash.slice(7);

  const contentURL = `https://api.hnpwa.com/v0/item/${id}.json`;
  const newsContent = Ajax(contentURL);

  for (let i = 0; i < newsFeed.length; i++) {
    if (newsFeed[i].id === Number(id)) {
      newsFeed[i].read = true;
      break;
    }
  }

  let template = `
    <div class="bg-gray-600 min-h-screen pb-8">
      <div class="bg-white text-xl">
        <div class="mx-auto px-4">
          <div class="flex justify-between items-center py-6">
            <div class="flex justify-start">
              <h1 class="font-extrabold">Hacker News</h1>
            </div>
            <div class="items-center justify-end">
              <a href="#/page/${currPage}" class="text-gray-500">
                <i class="fa fa-times"></i>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div class="h-full border rounded-xl bg-white m-6 p-4 ">
        <h2>${newsContent.title}</h2>
        <div class="text-gray-400 h-20">
          ${newsContent.content}
        </div>

        {{__comments__}}

      </div>
    </div>
  `;

  function makeComment(comments, called = 0) {
    const commentString = [];

    for (let i = 0; i < comments.length; i++) {
      commentString.push(`
        <div style="padding-left: ${called * 40}px;" class="mt-4">
          <div class="text-gray-400">
            <i class="fa fa-sort-up mr-2"></i>
            <strong>${comments[i].user}</strong> ${comments[i].time_ago}
          </div>
          <p class="text-gray-700">${comments[i].content}</p>
        </div>      
      `);

      if (comments[i].comments.length > 0) {
        commentString.push(makeComment(comments[i].comments, called + 1));
      }
    }

    return commentString.join("");
  }

  root.innerHTML = template.replace(
    "{{__comments__}}",
    makeComment(newsContent.comments)
  );
};

const router = () => {
  const routePath = location.hash;

  if (routePath === "") {
    newsLists();
  } else if (routePath.indexOf("#/show/") >= 0) {
    newsDetail();
  } else {
    currPage = Number(routePath.slice(7));
    newsLists();
  }
};

window.addEventListener("hashchange", router);

// client-side js
// run by the browser each time your view template is loaded



document.addEventListener('DOMContentLoaded', () => {
  window.myApp = (function () {


    function postData(url, data) {
      return fetch(url, {
        origin: 'same-site',
        credentials: 'include',
        method: 'POST',
        mode: 'same-origin',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)

      }).then(resp => resp.json());
    }


    function getData(url) {
      return fetch(url, {
        origin: 'same-site',
        credentials: 'include',
        method: 'GET',
        mode: 'same-origin',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }

      }).then(resp => resp.json());
    }


    const defaultQuery2 = `
    # Write your query or mutation here
    query searchSpotify($q:String){
      search(q:$q){
        tracks{
          items{
            name
            id
            album{
              images{
                url
              }
            }
          }
        }
      }
    }
    `;


    function graphqlQuery({
      variables,
      operationName,
      query = defaultQuery2
    }) {
      return fetch(`/graphql`, {
        credentials: "include",
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          variables,
          operationName,
          query
        })
      }).then(resp => resp.json());
    }




    const templates = {
      listItem(data) {
        return `<div class="media mb-4" data-id="${data.id}">
    <img class="mr-3" src="${data.album.images[0].url}" alt="Title">
    <div class="media-body d-flex flex-row align-self-stretch align-items-center">
    <div class="m">
      <h6 class="mb-0">${data.name}</h6>
      <p class="p-0 text-muted">${data.id}</p>
    </div>
      <div class="media-actions ml-auto">
        <a class="btn btn-sm"><i class="fas fa-plus"></i></a>
      </div></div>
    </div>`;
      }
    }


    const searchForm = document.querySelector('#searchForm')
    const searchInput = document.querySelector('#searchInput')
    const searchResults = document.querySelector('#searchResults')

    const app = {
      templates,
      getData,
      postData,
      elements: {
        searchForm,
        searchInput,
        searchResults
      },
      methods: {
        graphqlQuery,
        search(q) {
          return graphqlQuery({
            variables: {
              q
            },
            operationName: 'searchSpotify'
          }).then(resp => resp.data.search);
        },
        init() {
          this.elements.searchInput.addEventListener('input', (e) => {
            console.log('Search', e.target.value);
          });
        }
      }
    };
    return app;
  })();
})
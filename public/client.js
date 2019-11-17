// client-side js
// run by the browser each time your view template is loaded

console.log('hello world :o');

/*
// our default array of dreams
const dreams = [
  'Find and count some sheep',
  'Climb a really tall mountain',
  'Wash the dishes'
];

// define variables that reference elements on our page
const dreamsList = document.getElementById('dreams');
const dreamsForm = document.forms[0];
const dreamInput = dreamsForm.elements['dream'];

// a helper function that creates a list item for a given dream
const appendNewDream = function(dream) {
  const newListItem = document.createElement('li');
  newListItem.innerHTML = dream;
  dreamsList.appendChild(newListItem);
}

// iterate through every dream and add it to our page
dreams.forEach( function(dream) {
  appendNewDream(dream);
});

// listen for the form to be submitted and add a new dream when it is
dreamsForm.onsubmit = function(event) {
  // stop our form submission from refreshing the page
  event.preventDefault();

  // get dream value and add it to the list
  dreams.push(dreamInput.value);
  appendNewDream(dreamInput.value);

  // reset form 
  dreamInput.value = '';
  dreamInput.focus();
};

*/
const defaultQuery = `
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

function graphqlQuery({variables, operationName, query = defaultQuery}){
  return fetch(`/graphql`, {
  	credentials:"include",
    method: 'POST',
  	mode: 'cors',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      variables, operationName, query
    })
	}).then(resp => resp.json());
}


const myApp = {
  methods: {
    graphqlQuery,
    search(q){
      return graphqlQuery({
        variables: {q},
        operationName: 'searchSpotify'
      })
    }
  }
};
window.myApp = myApp;
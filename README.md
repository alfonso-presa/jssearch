#JSSearch

##Introduction

This is a little javascript fulltext search engine library for in browser indexing and search. The only dependency of this library is lodash, although if AngularJS is found in the context an `angular.search` module with a `SearchEngine` factory is provided instead of the global SearchEngine object.

## Usage

Both bower and npm dependency management are available.

To use this library just instantiate a `SearchEngine` object providing a list of the texts to index as follows:

```js
var engine = new SearchEngine([
   'sample text',
   'another thing to search',
]);

var results = engine.search('tex');

//Will output the original text: 'sample text'
console.log(results[0].data);

//Will output the score
console.log(results[0].socre);
```

## Options

An options object can be optionally passed to the `SearchEngine` constructor with the following items.

* **stopwords**: Contains an object where each key will be ignored in the documents when creating the search index.
* **synonyms**: Contains an object where each key should contain an array of words. Documents containing the key will be indexed instead on it's synonyms. If you want the key to also be used in the index, you should include it again in the list of synonyms.
* **minLength**: Words with no more than this ammount of characters will be excluded from the index and thus will not be taken into account when searching. By default this is **2**
* **tokenize**: A function that will be used instead of the default to split the texts to be indexed into an array of words.

```js
var engine = new SearchEngine([
   'sample text',
   'another thing to search',
], {
   stopwords: {thing: true}, //Will not index the word thing
   minLength: 3, //Will only index words with more than 3 characters (word 'to' will not be indexed)
   synonyms: {sample: ['example']}
});

var results = engine.search('example to look for');

//Results will only contain the 'sample text' item.
console.log(results[0].data);
```

## Custom document structure

If instead of a single text you want to index a complex object you can pass a `getText` function to the options object that should take a document and return an string with it's text to be indexed as follows:

```js
var engine = new SearchEngine([
   {title:'sample title', body: 'this is the body'},
   {title:'another document', body: 'it`s body'}
], {
    getText: function (item) {
        return item.title + ' ' + item.body;
    }
});
```

## Boosting

You can also give more weight to some documents by providing a `getDocScore` function inside the options object:

```js
var engine = new SearchEngine([
   {text:'will have a lot of weight when matched', score: 1000},
   {text:'will have little weight when matched', score: 0},
], {
    getText: function (item) {
        return item.text;
    },
    getDocScore: function (item) {
        return item.score;
    }
});
```





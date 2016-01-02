/* global angular,_ */
'use strict';

(function (root, angular) {

    function SearchEngine(data, options) {

        var indexObj = {};
        var indexArray = [];

        options = options || {};
        _.defaults(options, {
            stopwords: {},
            synonyms: {},
            minLength: 2,
            getText: function (item) {
                return item;
            },
            getDocScore: function () {
                return 0;
            },
            tokenize: function (val) {
                return _.deburr(val).toLowerCase().split(/[\s-_\/]/g);
            }
        });

        var mapSynonyms = options.synonyms;
        var tokenize = options.tokenize;

        function synonyms(val) {
            var value = mapSynonyms[val] || [val];
            var work = val.split(/'/g);
            if (work.length > 0) {
                value.push(work[1]);
            }
            return value;
        }

        function index(data) {
            _.forOwn(data, function (val, key) {
                var words = tokenize(options.getText(val));
                var stopsFound = 0;
                words.forEach(function (item, i) {
                    if (item.length > options.minLength && !options.stopwords[item]) {
                        synonyms(item).forEach(function (item) {
                            var entry = indexObj[item] || (indexObj[item] = { key: key, word: item, docs: [], factor: 0 });
                            entry.docs.push({ key: key, factor: (words.length - i) / (words.length - stopsFound) });
                        });
                    }
                    else {
                        stopsFound++;
                    }
                });
            });
            _.forOwn(indexObj, function (val) {
                val.factor += 1 / val.docs.length;
                indexArray.push(val);
            });

            indexArray = _.sortBy(indexArray, 'word');
        }

        this.search = function (text) {
            var words = tokenize(text);
            var docsMap = {};

            if (indexArray.length > 0 && text && text.length > 0) {
                words.forEach(function (item, pos) {
                    if (pos < words.length - 1 && (options.stopwords[item] || item.length < 3)) {
                        return;
                    }

                    var regexp = new RegExp('^' + item + (words.length !== pos + 1 ? '$' : ''));
                    var index = _.sortedIndex(indexArray, { 'word': item }, 'word');
                    var entry;
                    while ((entry = indexArray[index++]) && regexp.test((entry).word)) {
                        for (var i = 0; i < entry.docs.length; i++) {
                            var doc = entry.docs[i];
                            var id = doc.key;
                            var value = docsMap[id] || (docsMap[id] = { data: data[id], score: -options.getDocScore(data[id]) });
                            value.score -= (entry.factor + doc.factor) * (words.length - pos);
                        }
                    }
                });
            }
            return _.sortBy(_.values(docsMap), 'score');
        };

        index(data);
    }

    if (angular) {
        angular.module('angular.search').factory('SearchEngine', function () {
            return {
                build: function (data, options) {
                    return new SearchEngine(data, options);
                }
            }
        });
    }
    else {
        root.SearchEngine = SearchEngine;
    }

})(window, window.angular);

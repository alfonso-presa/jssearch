
describe('SearchEngine', function () {

    var engine;

    describe('default options', function () {
        beforeEach(function () {
            engine = new SearchEngine([
                'sample text',
                'text with priority',
                'should not be found'
            ])
        });

        it('should load', function () {
            expect(engine).not.toBeUndefined();
        });

        it('should return a results object', function () {
            expect(engine.search('')).not.toBeUndefined();
        });

        it('should return an empty results object when no query', function () {
            expect(engine.search('').length).toBe(0);
            expect(engine.search().length).toBe(0);
        });

        it('should return results when some found', function () {
            var result = engine.search('sam');
            expect(result).not.toBeUndefined();
            expect(result.length).toBe(1);
            expect(result[0].data).toBe('sample text');
        });
        it('should order results by number of coincidences', function () {
            var result = engine.search('priority text');
            expect(result).not.toBeUndefined();
            expect(result.length).toBe(2);
            expect(result[0].data).toBe('text with priority');
        });
        it('should provide score of matches', function () {
            var result = engine.search('priority text');
            expect(result).not.toBeUndefined();
            expect(result[0].score).not.toBe(0);
        });
    });

    describe('boosting', function () {
        beforeEach(function () {
            engine = new SearchEngine([
                { text: 'sample lot of boost', score: 100 },
                { text: 'sample with a lot of coincidences but low boost', score: 0 },
            ], {
                    getText: function (item) {
                        return item.text;
                    },
                    getDocScore: function (item) {
                        return item.score;
                    }
                });
        });
        it('should order results by number of coincidences', function () {
            var result = engine.search('sample with a lot of coincidences');
            expect(result.length).toBe(2);
            expect(result[0].data.text).toBe('sample lot of boost');
        });
    });

    describe('custom options', function () {
        beforeEach(function () {
            engine = new SearchEngine([
                'should not match',
                'note this one should match',
            ], {
                minLength: 3,
                stopwords: {should:true},
                synonyms: {
                    this: ['this','that']
                }
            })
        });

        it('should not match words below min length', function () {
            var result = engine.search('not');
            expect(result.length).toBe(1);
            expect(result[0].data).toBe('note this one should match');
        });

        it('should not match stop words', function () {
            var result = engine.search('this should');
            expect(result.length).toBe(1);
            expect(result[0].data).toBe('note this one should match');
        });

        it('should match synonyms', function () {
            var result = engine.search('that should');
            expect(result.length).toBe(1);
            expect(result[0].data).toBe('note this one should match');
        });
    });
});
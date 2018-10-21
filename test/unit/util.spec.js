import util from '../../src/lib/util';


describe('util', () => {
    it('text convert', () => {
        expect(util.convertContentsForEditor('test')).toEqual('<p>test</p>');
    });
});
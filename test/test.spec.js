import utils from '../src/lib/util';


describe('util.convertContentsForEditor', () => {
    it('text convert', () => {
        expect(utils.convertContentsForEditor('test')).toEqual('<p>test</p>');
    });
});
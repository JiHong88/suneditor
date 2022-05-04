import util from '../../src/lib/util';


describe('util', () => {
    it('text convert', () => {
        expect(util.convertContentForEditor('test')).toEqual('<p>test</p>');
    });
});
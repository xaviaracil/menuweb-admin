/* global define */
define(['jquery', 'underscore'], function($, _) {
  'use strict';
  describe('just checking', function() {
    it('works for underscore', function() {
      // just checking that _ works
      expect(_.size([1,2,3])).toEqual(3);
    });
  });
});

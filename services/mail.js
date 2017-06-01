// Copyright 2017 Albert Gasset
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

angular.module('mm.addons.local_mail')

/**
 * Mail factory.
 *
 * @module mm.addons.local_mail
 * @ngdoc service
 * @name $mmaLocalMail
 */
.factory('$mmaLocalMail', function($mmSite, $mmSitesManager, $mmEvents, $log, $q, mmaLocalMailUnreadChangedEvent) {
    $log = $log.getInstance('$mmaLocalMail');

    var self = {};

    /**
     * Returns whether or not the plugin is enabled in a certain site.
     *
     * Do not abuse this method.
     *
     * @module mm.addons.messages
     * @ngdoc method
     * @name $mmaMessages#isPluginEnabled
     * @param  {String} [siteId] Site ID. If not defined, current site.
     * @return {Promise}
     */
    self.isPluginEnabled = function(siteId) {
        siteId = siteId || $mmSite.getId();
        return $mmSitesManager.getSite(siteId).then(function(site) {
            return site.wsAvailable('local_mail_get_unread_count') ;
        });
    };

    /**
     * Get the cache key for menu info.
     *
     * @module mm.addons.local_mail
     * @ngdoc method
     * @name $mmaLocalMail#_getCacheKeyForMenu
     * @return {String}
     * @protected
     */
    self._getCacheKeyForMenu = function() {
        return 'mmaLocalMail:menuInfo';
    };

    /**
     * Get the cache key for an index.
     *
     * @module mm.addons.local_mail
     * @ngdoc method
     * @name $mmaLocalMail#_getCacheKeyForMenuIndex
     * @param {String} [type] Type of the index.
     * @param  {Number} [itemId] ID of the course or label.
     * @param  {Number} [offset] Skip this number of messages.
     * @param  {Number} [limit] Limit of messages to list.
     * @return {String}
     * @protected
     */
    self._getCacheKeyForIndex = function(type, itemId, offset, limit) {
        var key = 'mmaLocalMail:index:';

        if (typeof type !== 'undefined') {
            key += type + ':';
        }

        if (type == 'course' || type == 'label') {
            key += itemId + ':';
        }

        if (typeof offset !== 'undefined' && typeof limit !== 'undefined') {
            key += offset + ':' + limit;
        }

        return key;
    };

    /**
     * Get the cache key for a message.
     *
     * @module mm.addons.local_mail
     * @ngdoc method
     * @name $mmaLocalMail#_getCacheKeyForMessage
     * @param  {Number} [id] ID of the message.
     * @return {String}
     * @protected
     */
    self._getCacheKeyForMessage = function(id) {
        return 'mmaLocalMail:message' + id;
    };

    /**
     * Invalidate menu cache.
     *
     * @module mm.addons.local_mail
     * @ngdoc method
     * @name $mmaLocalMail#invalidateMenuCache
     * @return {Promise}
     */
    self.invalidateMenuCache = function() {
        return $mmSite.invalidateWsCacheForKey(self._getCacheKeyForMenu());
    };

    /**
     * Invalidate index cache.
     *
     * @module mm.addons.local_mail
     * @ngdoc method
     * @name $mmaLocalMail#invalidateIndexCache
     * @param {String} [type] Type of the index.
     * @param  {Number} [itemId] ID of the course or label.
     * @return {Promise}
     */
    self.invalidateIndexCache = function(type, itemId) {
        return $mmSite.invalidateWsCacheForKeyStartingWith(self._getCacheKeyForIndex(type, itemId));
    };

    /**
     * Invalidate message cache.
     *
     * @module mm.addons.local_mail
     * @ngdoc method
     * @name $mmaLocalMail#invalidateMessageCache
     * @param  {Number} [id] ID of the message.
     * @return {Promise}
     */
    self.invalidateMessageCache = function(id) {
        return $mmSite.invalidateWsCacheForKey(self._getCacheKeyForMessage(id));
    };

    /**
     * Get the number of unread messages.
     *
     * @module mm.addons.local_mail
     * @ngdoc method
     * @name $mmaLocalMail#getUnreadCount
     * @return {Promise}
     */
    self.getUnreadCount = function() {
        var presets = {
            getFromCache: 0,
            emergencyCache: 0,
            saveToCache: 0,
            typeExpected: 'number'
        };
        return $mmSite.read('local_mail_get_unread_count', {}, presets);
    };

    /**
     * Get the list of courses and labels and the number of unread messages.
     *
     * @module mm.addons.local_mail
     * @ngdoc method
     * @name $mmaLocalMail#getMenu
     * @return {Promise}
     */
    self.getMenu = function() {
        var presets = {
            cacheKey: self._getCacheKeyForMenu()
        };
        return $mmSite.read('local_mail_get_menu', {}, presets);
    };

    /**
     * Get the list of messages of a box with its metadata.
     *
     * @module mm.addons.local_mail
     * @ngdoc method
     * @name $mmaLocalMail#getIndex
     * @param {String} [type] Type of the index.
     * @param  {Number} [itemId] ID of the course or label.
     * @param  {Number} [offset] Skip this number of messages.
     * @param  {Number} [limit] Limit of messages to list.
     * @return {Promise}
     */
    self.getIndex = function(type, itemId, offset, limit) {
        if (type !== 'course' && type !== 'label') {
            itemId = 0;
        }
        var presets = {
            cacheKey: self._getCacheKeyForIndex(type, itemId, offset, limit)
        };
        var params = {
            type: type,
            itemid: itemId,
            offset: offset,
            limit: limit,
        };
        return $mmSite.read('local_mail_get_index', params, presets);
    };

    /**
     * Get a message.
     *
     * @module mm.addons.local_mail
     * @ngdoc method
     * @name $mmaLocalMail#getMessage
     * @param  {Number} [id] ID of the message.
     * @return {Promise}
     */
    self.getMessage = function(id) {
        var presets = {
            cacheKey: self._getCacheKeyForMessage(id)
        };
        return $mmSite.read('local_mail_get_message', {id: id}, presets);
    };

    /**
     * Sets the unread status of a message.
     *
     * @module mm.addons.local_mail
     * @ngdoc method
     * @name $mmaLocalMail#setUnread
     * @param  {Number} [id] ID of the message.
     * @param  {Boolean} [unread] New unread status.
     * @return {Promise}
     */
    self.setUnread = function(id, unread) {
        var params = {id: id, unread: unread ? '1' : '0'};
        var presets = {responseExpected: false};
        return $mmSite.write('local_mail_set_unread', params, presets).then(function() {
            var promises = [
                self.invalidateMessageCache(id),
                self.invalidateIndexCache(),
                self.invalidateMenuCache(),
            ];
            $q.all(promises).finally(function() {
                $mmEvents.trigger(mmaLocalMailUnreadChangedEvent, {
                    siteid: $mmSite.getId(),
                    messageid: id,
                    unread: unread,
                });
            });
        });
    };

    return self;
});

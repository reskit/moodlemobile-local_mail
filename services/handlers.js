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
 * Mail handlers factory.
 *
 * This factory holds the different handlers used for delegates.
 *
 * @module mm.addons.local_mail
 * @ngdoc service
 * @name $mmaLocalMailHandlers
 */
.factory('$mmaLocalMailHandlers', function($log, $mmaLocalMail, $mmSitesManager, $mmEvents, $mmContentLinkHandlerFactory,
        $mmContentLinksHelper, mmaLocalMailUnreadChangedEvent) {
    $log = $log.getInstance('$mmaMessagesHandlers');

    var self = {};

    /**
     * Side menu nav handler.
     *
     * @module mm.addons.local_mail
     * @ngdoc method
     * @name $mmaLocalMailHandlers#sideMenuNav
     */
    self.sideMenuNav = function() {

        var self = {};

        /**
         * Check if handler is enabled.
         *
         * @return {Promise} Promise resolved with true if handler is enabled, false otherwise.
         */
        self.isEnabled = function() {
            return $mmaLocalMail.isPluginEnabled();
        };

        /**
         * Get the controller.
         *
         * @return {Object} Controller.
         */
        self.getController = function() {

            /**
            * Side menu nav handler controller.
            *
            * @module mm.addons.local_mail
            * @ngdoc controller
            * @name $mmaLocalMailHandlers#sideMenuNav:controller
            */
            return function($scope) {
                $scope.icon = 'ion-email';
                $scope.title = 'mma.local_mail.mail';
                $scope.state = 'site.local_mail';
                $scope.class = 'mma.local_mail-handler';

                unreadChangedObserver = $mmEvents.on(mmaLocalMailUnreadChangedEvent, function(data) {
                    if (data && $mmSitesManager.isCurrentSite(data.siteid)) {
                        updateBadge();
                    }
                });

                function updateBadge() {
                    $mmaLocalMail.getMenu().then(function(info) {
                        $scope.badge = info.unread;
                    });
                }

                updateBadge();
            };
        };

        /**
         * Execute the process.
         * Receives the ID of the site affected, undefined for all sites.
         *
         * @param  {String} [siteId] ID of the site affected, undefined for all sites.
         * @return {Promise}         Promise resolved when done, rejected if failure.
         */
        self.execute = function(siteId) {
            if ($mmSitesManager.isCurrentSite(siteId) && $mmaLocalMail.isPluginEnabled()) {
                $mmaLocalMail.invalidateMenuCache().finally(function() {
                    $mmEvents.trigger(mmaLocalMailUnreadChangedEvent, {
                        siteid: siteId
                    });
                });
            }
        };

        /**
         * Get the time between consecutive executions.
         *
         * @return {Number} Time between consecutive executions (in ms).
         */
        self.getInterval = function() {
            return 10000; // 5 minutes.
        };

        /**
         * Whether it's a synchronization process or not.
         *
         * @return {Boolean} True if is a sync process, false otherwise.
         */
        self.isSync = function() {
            return true;
        };

        /**
         * Whether the process uses network or not.
         *
         * @return {Boolean} True if uses network, false otherwise.
         */
        self.usesNetwork = function() {
            return true;
        };

        return self;
    };

    /**
     * Content links handler for a mail message.
     * Match local/mail/view.php with a valid message ID.
     *
     * @module mm.addons.local_mail
     * @ngdoc method
     * @name $mmaLocalMailHandlers#messageLinksHandler
     */
    self.messageLinksHandler = $mmContentLinkHandlerFactory.createChild(
            /\/local\/mail\/view\.php.*([\&\?]m=\d+)/, '$mmSideMenuDelegate_mmaLocalMail');

    self.messageLinksHandler.isEnabled = function(siteId, url, params, courseId) {
        return $mmaLocalMail.isPluginEnabled(siteId);
    };

    self.messageLinksHandler.getActions = function(siteIds, url, params, courseId) {
        return [{
            action: function(siteId) {
                var stateParams = {
                    id: parseInt(params.m, 10),
                    subject: '',
                };
                $mmContentLinksHelper.goInSite('site.local_mail-message', stateParams, siteId);
            }
        }];
    };

    return self;
});

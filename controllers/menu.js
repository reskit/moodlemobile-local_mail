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
 * Controller to handle the mail menu.
 *
 * @module mma.local_mail
 * @ngdoc controller
 * @name mmaLocalMailMenuCtrl
 */
.controller('mmaLocalMailMenuCtrl', function($scope, $mmaLocalMail, $mmUtil, $mmSitesManager, $mmEvents, mmaLocalMailUnreadChangedEvent) {

    function fetchMenu() {
        return $mmaLocalMail.getMenu().then(function(menu) {
            $scope.menu = menu;
        }, function(error) {
            $mmUtil.showErrorModal(error);
        });
    }

    $scope.refreshMenu = function() {
        $mmaLocalMail.invalidateMenuCache().finally(function() {
            fetchMenu().finally(function() {
                $scope.$broadcast('scroll.refreshComplete');
            });
        });
    };

    var unreadChangedObserver = $mmEvents.on(mmaLocalMailUnreadChangedEvent, function(data) {
        if (data && $mmSitesManager.isCurrentSite(data.siteid)) {
            fetchMenu();
        }
    });

    $scope.$on('$destroy', function() {
        if (unreadChangedObserver) {
            unreadChangedObserver.off();
        }
    });

    fetchMenu().finally(function() {
        $scope.menuLoaded = true;
    });
});

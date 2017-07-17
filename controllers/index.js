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
 * Controller to handle the mail index.
 *
 * @module mma.local_mail
 * @ngdoc controller
 * @name mmaLocalMailIndexCtrl
 */
.controller('mmaLocalMailIndexCtrl', function($scope, $state, $stateParams, $mmSitesManager, $mmSite, $translate, $mmaLocalMail, $mmUtil, $mmEvents, mmaLocalMailUnreadChangedEvent) {

    $scope.messages = [];
    $scope.current = null;
    $scope.userid = $mmSite.getUserId();
    $scope.type = $stateParams.type;
    $scope.id = $stateParams.id;

    if ($stateParams.type == 'course' || $stateParams.type == 'label') {
        $scope.title = $stateParams.name;
    } else {
        $scope.title = $translate.instant('mma.local_mail.' + $stateParams.type);
    }

    function fetchIndex(refresh) {
        var query = {limit: 20};
        if (!refresh && $scope.messages.length > 0) {
            query.beforeid = $scope.messages[$scope.messages.length - 1].id;
        }
        return $mmaLocalMail.searchIndex($stateParams.type, $stateParams.id, query).then(function(index) {
            $scope.moreAvailable = index.messages.length > 0;
            if (refresh) {
                $scope.messages = index.messages;
            } else {
                $scope.messages = $scope.messages.concat(index.messages);
            }
        }, function(error) {
            $mmUtil.showErrorModal(error);
        });
    }

    var unreadChangedObserver = $mmEvents.on(mmaLocalMailUnreadChangedEvent, function(data) {
        if (data && $mmSitesManager.isCurrentSite(data.siteid)) {
            angular.forEach($scope.messages, function(message) {
                if (message.id == data.messageid) {
                    message.unread = data.unread;
                }
            });
        }
    });

    $scope.goToMessage = function(message) {
        $scope.current = message.id;
        $state.go('site.local_mail-message', {id: message.id, subject: message.subject});
    };

    $scope.loadMore = function() {
        fetchIndex(false).finally(function() {
            $scope.$broadcast('scroll.infiniteScrollComplete');
        });
    };

    $scope.refreshIndex = function() {
        $mmaLocalMail.invalidateIndexCache($stateParams.type, $stateParams.id).finally(function() {
            fetchIndex(true).finally(function() {
                $scope.$broadcast('scroll.refreshComplete');
            });
        });
    };

    $scope.$on('$destroy', function() {
        if (unreadChangedObserver) {
            unreadChangedObserver.off();
        }
    });

    fetchIndex(true).finally(function() {
        $scope.indexLoaded = true;
    });
});

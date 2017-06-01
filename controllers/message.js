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
 * Controller to handle a mail message.
 *
 * @module mma.local_mail
 * @ngdoc controller
 * @name mmaLocalMailMessageCtrl
 */
.controller('mmaLocalMailMessageCtrl', function($scope, $stateParams, $mmSite, $mmUtil, $ionicHistory, $mmaLocalMail) {
    $scope.title = $stateParams.title;
    $scope.userid = $mmSite.getUserId();
    $scope.message = null;

    function fetchMessage() {
        return $mmaLocalMail.getMessage($stateParams.id).then(function(message) {
            $scope.message = message;
        }, function(error) {
            $mmUtil.showErrorModal(error);
        });
    }

    $scope.refreshMessage = function() {
        $mmaLocalMail.invalidateMessageCache($stateParams.id).finally(function() {
            fetchMessage().finally(function() {
                $scope.$broadcast('scroll.refreshComplete');
            });
        });
    };

    $scope.recipients = function(type) {
        var result = [];
        angular.forEach($scope.message.recipients, function(recipient) {
            if (recipient.type == type) {
                result.push(recipient);
            }
        });
        return result;
    };

    $scope.markAsUnread = function() {
        $mmaLocalMail.setUnread($scope.message.id, true).finally(function() {
            $ionicHistory.goBack();
        });
    };

    fetchMessage().then(function() {
        if ($scope.message.unread) {
            $mmaLocalMail.setUnread($scope.message.id, false);
            $scope.message.unread = false;
        }
    });
});

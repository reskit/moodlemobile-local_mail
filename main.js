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

angular.module('mm.addons.local_mail', ['mm.core'])

.constant('mmaLocalMailPriority', 500)
.constant('mmaLocalMailUnreadChangedEvent', 'mma.local_mail_unread_changed')

.config(function($stateProvider, $mmSideMenuDelegateProvider, $mmContentLinksDelegateProvider, mmaLocalMailPriority) {

    $stateProvider

    .state('site.local_mail', {
        url: '/mail',
        params: {
        },
        views: {
            'site': {
                templateUrl: 'addons/local/mail/templates/menu.html',
                controller: 'mmaLocalMailMenuCtrl'
            }
        }
    })

    .state('site.local_mail-index', {
        url: '/mail-index',
        params: {
            type: null,
            id: null,
            name: null
        },
        views: {
            'site': {
                templateUrl: 'addons/local/mail/templates/index.html',
                controller: 'mmaLocalMailIndexCtrl'
            }
        }
    })

    .state('site.local_mail-message', {
        url: '/mail-message',
        params: {
            id: null,
            subject: null,
        },
        views: {
            'site': {
                templateUrl: 'addons/local/mail/templates/message.html',
                controller: 'mmaLocalMailMessageCtrl'
            }
        }
    });

    // Register side menu addon.
    $mmSideMenuDelegateProvider.registerNavHandler('mmaLocalMail', '$mmaLocalMailHandlers.sideMenuNav', mmaLocalMailPriority);

    // Register link handler.
    $mmContentLinksDelegateProvider.registerLinkHandler('mmaLocalMail:message', '$mmaLocalMailHandlers.messageLinksHandler');
})

.run(function($mmCronDelegate) {
    $mmCronDelegate.register('mmaLocalMailMenu', '$mmaLocalMailHandlers.sideMenuNav');
});

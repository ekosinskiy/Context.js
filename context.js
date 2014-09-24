/* 
 * Context.js
 * Copyright Jacob Kelley
 * MIT License
 * Modify by Evgeniy Kosinskiy
 */

var context = context || (function () {
        var clickedElement,
            $menuContent,
            options = {
                fadeSpeed: 100,
                filter: function ($obj) {
                    // Modify $obj, Do not return
                },
                open: function ($menu) {
                    // Event process when open menu
                },
                hide: function() {
                    // Event process when menu close
                },
                above: 'auto',
                preventDoubleContext: true,
                compress: false
            };

        function getClickedElement () {
            return clickedElement;
        }

        function getMenuContent() {
            return $menuContent;
        }

        function initialize(opts) {

            options = $.extend({}, options, opts);

            $(document).on('click', 'html', function () {
                $('.dropdown-context').fadeOut(options.fadeSpeed, function(){
                    $('.dropdown-context').css({display:''}).find('.drop-left').removeClass('drop-left');
                    if(typeof options.hide == "function") {
                        options.hide();
                    }
                });
            });
            if(options.preventDoubleContext){
                $(document).on('contextmenu', '.dropdown-context', function (e) {
                    e.preventDefault();
                });
            }
            $(document).on('mouseenter', '.dropdown-submenu', function(){
                var $sub = $(this).find('.dropdown-context-sub:first'),
                    subWidth = $sub.width(),
                    subLeft = $sub.offset().left,
                    collision = (subWidth+subLeft) > window.innerWidth;
                if(collision){
                    $sub.addClass('drop-left');
                }
            });

        }

        function updateOptions(opts){
            options = $.extend({}, options, opts);
        }

        function buildMenu(data, subMenu) {
            var subClass = (subMenu) ? ' dropdown-context-sub' : '',
                compressed = options.compress ? ' compressed-context' : '',
                $menu = $('<ul class="js-dropdown-context-menu dropdown-menu dropdown-context' + subClass + compressed+'"></ul>');
            var i = 0, linkTarget = '';
            for(i; i<data.length; i++) {
                if (typeof data[i].divider !== 'undefined') {
                    $menu.append('<li class="divider"></li>');
                } else if (typeof data[i].header !== 'undefined') {
                    $menu.append('<li class="nav-header">' + data[i].header + '</li>');
                } else {
                    if (typeof data[i].href == 'undefined') {
                        data[i].href = '#';
                    }
                    if (typeof data[i].target !== 'undefined') {
                        linkTarget = ' target="'+data[i].target+'"';
                    }
                    if (typeof data[i].subMenu !== 'undefined') {
                        $sub = ('<li class="dropdown-submenu"><a tabindex="-1" href="' + data[i].href + '">' + data[i].text + '</a></li>');
                    } else {
                        $sub = $('<li><a tabindex="-1" href="' + data[i].href + '"'+linkTarget+'>' + data[i].text + '</a></li>');
                    }
                    if (typeof data[i].action !== 'undefined') {
                        var actiond = new Date(),
                            actionID = 'event-' + actiond.getTime() * Math.floor(Math.random()*100000),
                            eventAction = data[i].action;
                        $sub.find('a').attr('id', actionID);
                        $('#' + actionID).addClass('context-event');
                        $(document).on('click', '#' + actionID, eventAction);
                    }
                    $menu.append($sub);
                    if (typeof data[i].subMenu != 'undefined') {
                        var subMenuData = buildMenu(data[i].subMenu, true);
                        $menu.find('li:last').append(subMenuData);
                    }
                }
                if (typeof options.filter == 'function') {
                    options.filter($menu.find('li:last'));
                }
            }
            return $menu;
        }

        function addContext(selector, data) {
            if($('.js-dropdown-context-menu').length == 0) {
                $menuContent = buildMenu(data);
                $('body').append($menuContent);
            }

            $(document).on('contextmenu', selector, function (e) {
                var $dd;
                e.preventDefault();
                e.stopPropagation();
                clickedElement = e.currentTarget;
                options.open($menuContent);
                $('.dropdown-context:not(.dropdown-context-sub)').hide();

                $dd = $('.js-dropdown-context-menu');
                if (typeof options.above == 'boolean' && options.above) {
                    $dd.addClass('dropdown-context-up').css({
                        top: e.pageY - 20 - $dd.height(),
                        left: e.pageX - 13
                    }).fadeIn(options.fadeSpeed);
                } else if (typeof options.above == 'string' && options.above == 'auto') {
                    $dd.removeClass('dropdown-context-up');
                    var autoH = $dd.height() + 12;
                    if ((e.pageY + autoH) > $('html').height()) {
                        $dd.addClass('dropdown-context-up').css({
                            top: e.pageY - 20 - autoH,
                            left: e.pageX - 13
                        }).fadeIn(options.fadeSpeed);
                    } else {
                        $dd.css({
                            top: e.pageY + 10,
                            left: e.pageX - 13
                        }).fadeIn(options.fadeSpeed);
                    }
                }
            });
        }

        function destroyContext(selector) {
            $(document).off('contextmenu', selector).off('click', '.context-event');
            $('.js-dropdown-context-menu').remove();
        }

        return {
            init: initialize,
            settings: updateOptions,
            attach: addContext,
            destroy: destroyContext,
            getClickedElement: getClickedElement,
            getMenuContent: getMenuContent
        };
    })();
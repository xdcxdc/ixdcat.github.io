(function(w, d) {

    var body = d.body,
        $ = d.querySelector.bind(d),
        $$ = d.querySelectorAll.bind(d),
        root = $('html'),
        gotop = $('#gotop'),
        menu = $('#menu'),
        header = $('#header'),
        mask = $('#mask'),
        menuToggle = $('#menu-toggle'),
        menuOff = $('#menu-off'),
        loading = $('#loading'),
        animate = w.requestAnimationFrame,
        forEach = Array.prototype.forEach,
        even = ('ontouchstart' in w && /Mobile|Android|iOS|iPhone|iPad|iPod|Windows Phone|KFAPWI/i.test(navigator.userAgent)) ? 'touchstart' : 'click',
        noop = function() {},
        offset = function(el) {
            var x = el.offsetLeft,
                y = el.offsetTop;

            if (el.offsetParent) {
                var pOfs = arguments.callee(el.offsetParent);
                x += pOfs.x;
                y += pOfs.y;
            }

            return {
                x: x,
                y: y
            };
        },
        docEl = navigator.userAgent.indexOf('Firefox') !== -1 ? d.documentElement : body;

    var Blog = {
        goTop: function() {
            var top = docEl.scrollTop;
            if (top > 400) {
                docEl.scrollTop = top - 400;
                animate(arguments.callee);
            } else {
                docEl.scrollTop = 0;
            }
        },
        toggleGotop: function(top) {
            if (top > w.innerHeight / 2) {
                gotop.classList.add('in');
            } else {
                gotop.classList.remove('in');
            }
        },
        toggleMenu: function(flag) {

            if (flag) {
                menu.classList.remove('hide');

                if (w.innerWidth < 1241) {
                    mask.classList.add('in');
                    menu.classList.add('show');
                    root.classList.add('lock');
                }

            } else {
                menu.classList.remove('show');
                mask.classList.remove('in');
                root.classList.remove('lock');
            }
        },
        fixedHeader: function(top) {
            if (top > header.clientHeight) {
                header.classList.add('fixed');
            } else {
                header.classList.remove('fixed');
            }
        },
        fixedToc: (function() {
            var toc = $('#post-toc');

            if (!toc || !toc.children.length) {
                return noop;
            }

            var tocOfs = offset(toc),
                tocTop = tocOfs.y,
                headerH = header.clientHeight,
                titles = $('#post-content').querySelectorAll('h1, h2, h3, h4, h5, h6');

            toc.querySelector('a[href="#' + titles[0].id + '"]').parentNode.classList.add('active');

            forEach.call($$('a[href^="#"]'), function(el) {

                el.addEventListener('click', function(e) {
                    e.preventDefault();
                    docEl.scrollTop = offset($('[id="' + decodeURIComponent(this.hash).substr(1) + '"]')).y - headerH + 10;
                })
            });

            function setActive(top) {

                for (i = 0, len = titles.length; i < len; i++) {
                    if (top > offset(titles[i]).y - headerH) {
                        toc.querySelector('li.active').classList.remove('active');

                        var active = toc.querySelector('a[href="#' + titles[i].id + '"]').parentNode;
                        active.classList.add('active');

                        if (active.offsetTop >= toc.clientHeight - headerH) {
                            toc.scrollTop = active.offsetTop - toc.clientHeight + parseInt(w.innerHeight / 3);
                        } else {
                            toc.scrollTop = 0;
                        }
                    }
                }

                if (top < offset(titles[0]).y) {
                    toc.querySelector('li.active').classList.remove('active');
                    toc.querySelector('a[href="#' + titles[0].id + '"]').parentNode.classList.add('active');
                }
            }

            return function(top) {
                if (top > tocTop - headerH) {
                    toc.classList.add('fixed');
                } else {
                    toc.classList.remove('fixed');

                }

                setActive(top);
            };
        })(),
        modal: function(target) {
            this.$modal = $(target);
            this.$off = this.$modal.querySelector('.close');

            var _this = this;

            function hideByBody(e) {
                if (!_this.$modal.contains(e.target)) {
                    _this.hide();
                }
            }

            this.show = function() {
                mask.classList.add('in');
                _this.$modal.classList.add('ready');
                setTimeout(function() {
                    _this.$modal.classList.add('in');
                    d.addEventListener(even, hideByBody);
                }, 0)
            }

            this.hide = function() {
                mask.classList.remove('in');
                _this.$modal.classList.remove('in');
                setTimeout(function() {
                    _this.$modal.classList.remove('ready');
                    d.removeEventListener(even, hideByBody);
                }, 300)
            }

            this.toggle = function() {
                return _this.$modal.classList.contains('in') ? _this.hide() : _this.show();
            }

            this.$off && this.$off.addEventListener(even, this.hide);
        },
        share: function() {

            var pageShare = $('#pageShare'),
                fab = $('#shareFab');

            var shareModal = new this.modal('#globalShare');

            $('#menuShare').addEventListener(even, shareModal.toggle);

            if(fab) {
                fab.addEventListener(even, function() {
                    pageShare.classList.toggle('in')
                }, false)

                d.addEventListener(even, function(e){
                    !fab.contains(e.target) && pageShare.classList.remove('in')
                }, false)
            }

            var wxModal = new this.modal('#wxShare');

            forEach.call($$('.wxFab'), function(el){
                el.addEventListener(even, wxModal.toggle)
            })

        },
        search: function() {
            var searchWrap = $('#search-wrap');

            function toggleSearch() {
                searchWrap.classList.toggle('in');
            }

            $('#search').addEventListener(even, toggleSearch);
        },
        reward: function() {
            var modal = new this.modal('#reward')

            $('#rewardBtn').addEventListener(even, modal.toggle)
        },
        fixNavMinH: (function() {
            var nav = $('.nav');

            function calcH() {
                nav.style.minHeight = (nav.parentNode.clientHeight - nav.nextElementSibling.offsetHeight) + 'px';
            }

            return calcH;
        })(),
        waterfall: function() {

            if (w.innerWidth < 760) return;

            var els = $$('.waterfall');

            forEach.call(els, function(el) {
                var childs = el.querySelectorAll('.waterfall-item');
                var columns = [0, 0];

                forEach.call(childs, function(item) {
                    var i = columns[0] <= columns[1] ? 0 : 1;
                    item.style.cssText = 'top:' + columns[i] + 'px;left:' + (i > 0 ? '50%' : 0);
                    columns[i] += item.offsetHeight;
                })

                el.style.height = Math.max(columns[0], columns[1]) + 'px';
                el.classList.add('done')
            })

        },
        tabBar: function(el) {
            el.parentNode.parentNode.classList.toggle('expand')
        }
    };

    w.addEventListener('load', function() {
        Blog.fixNavMinH();
        Blog.waterfall();
        loading.classList.remove('active');
    });

    w.addEventListener('resize', function() {
        w.BLOG.even = even = 'ontouchstart' in w ? 'touchstart' : 'click';
        Blog.fixNavMinH();
        Blog.toggleMenu();
        Blog.waterfall();
    });

    gotop.addEventListener(even, function() {
        animate(Blog.goTop);
    }, false);

    menuToggle.addEventListener(even, function(e) {
        Blog.toggleMenu(true);
        e.preventDefault();
    }, false);

    menuOff.addEventListener(even, function() {
        menu.classList.add('hide');
    }, false);

    mask.addEventListener(even, function() {
        Blog.toggleMenu();
    }, false);

    d.addEventListener('scroll', function() {
        var top = docEl.scrollTop;
        Blog.toggleGotop(top);
        Blog.fixedHeader(top);
        Blog.fixedToc(top);
    }, false);

    if (w.BLOG.SHARE) {
        Blog.share()
    }

    if (w.BLOG.REWARD) {
        Blog.reward()
    }

    Blog.docEl = docEl;
    Blog.noop = noop;
    Blog.even = even;
    Blog.$ = $;
    Blog.$$ = $$;

    Object.keys(Blog).reduce(function(g, e) {
         g[e] = Blog[e];
         return g
    }, w.BLOG);

    Waves.init();
    Waves.attach('.global-share li', ['waves-block']);
    Waves.attach('.article-tag-list-link, #page-nav a, #page-nav span', ['waves-button']);

})(window, document);

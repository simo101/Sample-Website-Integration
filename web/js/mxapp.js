(function() {
    var defaultConfig = {
        files: {
            js: [ "mxclientsystem/mxui/mxui.js" ],
            css: [
                "lib/bootstrap/css/bootstrap.min.css","mxclientsystem/mxui/ui/mxui.css","styles/css/lib/lib.css","styles/css/custom/custom.css"
            ],
        },
        cachebust: +new Date()
    };

    function request(url, params) {
        var xhr = new XMLHttpRequest();
        xhr.open(params.method, url);

        if (params.onLoad) {
            xhr.onreadystatechange = function() {
                if (xhr.readyState != 4) return;
                params.onLoad(xhr.status, xhr.statusText, xhr.responseText);
            };
        }

        if (params.headers) {
            for (var header in params.headers) {
                xhr.setRequestHeader(header, params.headers[header]);
            }
        }

        if (params.timeout) {
            xhr.timeout = params.timeout;
            xhr.ontimeout = params.onTimeout;
        }

        xhr.send(params.data);
    }

    function showError(message) {
        document.getElementById("mxalert_message").textContent = message;
        document.getElementById("mxalert_button").addEventListener("touchstart", function() {
            window.location.reload();
        });

        document.getElementById("mxalert").style.display = "block";
    }

    window.mxapp = {
        _appUrl: "",
        _appConfig: null,
		parameters: {},

        _startup: function() {
            window.dojoConfig = {
                appbase: this._appUrl,
                baseUrl: this._appUrl + "mxclientsystem/dojo/"
            };

            var head = document.getElementsByTagName("head")[0];

            this._appConfig.files.css.forEach(function(href) {
                var link = document.createElement("link");
                link.rel = "stylesheet";
                link.href = this._appUrl + href + "?v=" + this._appConfig.cachebust;

                head.appendChild(link);
            }, this);

            this._appConfig.files.js.forEach(function(href) {
                var script = document.createElement("script");
                script.src = this._appUrl + href + "?v=" + this._appConfig.cachebust;

                head.appendChild(script);
            }, this);
        },

        _getConfig: function(callback) {
            var attempts = 20,
                configUrl = this._appUrl + "components.json";

            function fetchConfig(callback) {
                request(configUrl, {
                    method: "get",
                    timeout: 5000,
                    onLoad: callback,
                    onTimeout: function() {
                        showError("The connection timed out. Please try again later.");
                    }
                });
            }

            fetchConfig(function(status, statusText, result) {
                if (status == 200) {
                    callback(JSON.parse(result));
                } else if (status == 404) {
                    // If config is not found, assume the default config
                    callback(defaultConfig);
                } else if (status == 503) {
                    if (--attempts > 0) {
                        // If the app is suspended, wait for it to wake up
                        setTimeout(fetchConfig, 5000);
                    } else {
                        showError("The application failed to wake up. Please try again later.");
                    }
                } else {
                    showError("A connection error occurred (" + statusText + "). Please try again later.");
                }
            });
        },

        initialize: function(url) {
            // Make sure the url always ends with a /
            this._appUrl = url.replace(/\/?$/, "/");

            this._getConfig(function(config) {
                    this._appConfig = config;
                    this._startup();
                }.bind(this));
        }
    };
})();

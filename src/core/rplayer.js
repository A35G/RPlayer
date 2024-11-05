var RPlayer = (element, options) => 
    ((element, options) => {
        const vstart = 67;
        let source = null;
        let container = null;

        let era = {
            audio: null,    //  Audio
            imgcv: null,    //  Cover
            ppbtt: null,    //  Play/Pause
            fwbtt: null,    //  Forward
            pvbtt: null,    //  Previous
            vmbtt: null,    //  Mute/Unmute
            lpbtt: null,    //  Loop
            vmbar: null,    //  Volume Bar
            drbar: null,    //  
            prbar: null,    //  Progress Bar
            prcbr: null,    //  Progress Bar container
            dtime: {
                actual: null,
                total: null
            }
        };

        const isObjectElement = (value) => Object.prototype.toString.call(value) === "[object Object]";

        const isObjectEmpty = (objectName) => (objectName && Object.keys(objectName).length === 0 && objectName.constructor === Object);

        const isEmpty = (args) => (args === "" || args === 0 || args === "0" || args === null || args === !1 || args === undefined || args.length === 0);

        const mngVolume = () => {
            const toMute = ["mute", "vmid", "vlow"];
            const vtp = document.getElementById(era.vmbtt).getAttribute("data-btt");

            if (toMute.includes(vtp)) {
                document.getElementById(era.vmbtt).setAttribute("data-btt", "unmute");
                document.getElementById(era.vmbar).value = 0;
                document.getElementById(era.audio).volume = 0;
            } else if (vtp === "unmute") {
                const vs = document.getElementById(era.vmbar).getAttribute("data-sndv");
                document.getElementById(era.vmbar).value = vs;
                document.getElementById(era.audio).volume = vs;

                if (vs == 0) {
                    document.getElementById(era.vmbtt).setAttribute("data-btt", "unmute");
                } else if (vs > 0 && vs <= 0.3) {
                    document.getElementById(era.vmbtt).setAttribute("data-btt", "vlow");
                } else if (vs > 0.3 && vs <= 0.7) {
                    document.getElementById(era.vmbtt).setAttribute("data-btt", "vmid");
                } else {
                    document.getElementById(era.vmbtt).setAttribute("data-btt", "mute");
                }
            }
        }

        const mngPPtrack = () => {
            const ptp = document.getElementById(era.ppbtt).getAttribute("data-btt");

            if (ptp === "play") {
                document.getElementById(era.audio).play();
            } else {
                document.getElementById(era.audio).pause();
            }

            const nwpp = (ptp === "play") ? "pause" : "play";
            document.getElementById(era.ppbtt).setAttribute("data-btt", nwpp);
        }

        const toTime = (seconds) => {
            let date = new Date(null);
            date.setSeconds(parseInt(seconds));
            const dtx = date.toISOString();
            return (
                (dtx.substr(11, 3) === '00:') 
                    ? dtx.substr(14, 5) 
                    : dtx.substr(11, 3)
            );
        }

        const bSound = (args) => {
            source = document.createElement("source");
            source.setAttribute("src", args.paths);
            source.setAttribute("type", args.types);
            source.id = "rpsrc";

            document.getElementById(era.audio).appendChild(source);
        }

        const loadSong = async (args) => {
            let optRq = {
                method: "GET"
            };

            try {
                const myRequest = new Request(args, optRq);

                const rsp = await fetch(myRequest);

                if (!rsp.ok) {
                    throw new Error(`Response status: ${rsp.status}`);
                }

                const contentType = rsp.headers.get('content-type');
                if (!contentType) {
                    throw new TypeError("Content-Type not available!");
                }

                if (document.getElementById(era.audio).canPlayType(contentType) !== "") {
                    const m = {
                        paths: args,
                        types: contentType
                    };

                    bSound(m);
                }
            } catch (error) {
                console.error(error.message);
            }
        }

        const drawPlayer = () => {
            //  Audio TAG
            const ad = document.createElement("audio");
            era.audio = ad.id = "rpaudio";

            //  Audio Track Cover Image
            const cv = document.createElement("div");
            era.imgcv = cv.id = "rpcover";

            //  Audio Control Area
            const cn = document.createElement("div");
            cn.id = "rpcontrols";

            //  Audio Track Progress
            const pgr = document.createElement("div");
            era.prcbr = pgr.id = "rprogress";

            //  Progress Bar
            const pgb = document.createElement("div");
            era.prbar = pgb.id = "rprogress-bar";

            pgr.appendChild(pgb);

            cn.appendChild(pgr);

            //  Control Buttons and Informations

            //  Track status
            const actm = document.createElement("span");
            era.dtime.actual = actm.id = "current-time";
            actm.textContent = "00:00";

            //  Total Track Time
            const tttm = document.createElement("span");
            era.dtime.total = tttm.id = "total-time";
            tttm.textContent = "00:00";

            // Track Time Content
            const crt = document.createElement("div");
            crt.id = "rpsngtime";

            crt.appendChild(actm);

            crt.innerHTML += "/";

            crt.appendChild(tttm);

            const btt = document.createElement("div");
            btt.id = "rpbuttons";

            btt.appendChild(crt);

            //  Play/Pause Button
            const ppb = document.createElement("button");
            era.ppbtt = ppb.id = "pptrack";
            ppb.className = "rpbttcn";
            ppb.setAttribute("type", "button");
            ppb.setAttribute("data-btt", "play");
            ppb.disabled = true;
            ppb.addEventListener("click", () => {
                mngPPtrack();
            });

            btt.appendChild(ppb);

            //  Volume/Mute Button
            const vmb = document.createElement("button");
            era.vmbtt = vmb.id = "volume";
            vmb.className = "rpbttcn";
            vmb.setAttribute("type", "button");
            vmb.setAttribute("data-btt", "mute");
            vmb.addEventListener("click", () => {
                mngVolume();
            });

            //  Volume Range
            const vrange = document.createElement("input");
            vrange.setAttribute("type", "range");
            era.vmbar = vrange.id = "volumec";
            vrange.setAttribute("min", 0);
            vrange.setAttribute("max", 1);
            vrange.setAttribute("step", "0.01");
            vrange.value = vstart;
            vrange.setAttribute("data-sndv", vstart);
            vrange.addEventListener("input", (event) => {
                vrange.setAttribute("data-sndv", event.target.value);
                document.getElementById(era.audio).volume = event.target.value;
                if (event.target.value == 0) {
                    document.getElementById(era.vmbtt).setAttribute("data-btt", "unmute");
                } else if (event.target.value > 0 && event.target.value <= 0.3) {
                    document.getElementById(era.vmbtt).setAttribute("data-btt", "vlow");
                } else if (event.target.value > 0.3 && event.target.value <= 0.7) {
                    document.getElementById(era.vmbtt).setAttribute("data-btt", "vmid");
                } else {
                    document.getElementById(era.vmbtt).setAttribute("data-btt", "mute");
                }
            });

            const contvol = document.createElement("div");
            contvol.id = "rpareav";

            contvol.appendChild(vmb);
            contvol.appendChild(vrange);

            btt.appendChild(contvol);

            cn.appendChild(btt);

            const bc = document.createElement("div");
            bc.id = "rpcontainer";
            bc.className = "big_card";

            bc.appendChild(cv);
            bc.appendChild(cn);

            container.innerHTML = "";
            container.appendChild(ad);
            container.appendChild(bc);

            document.getElementById(era.audio).addEventListener("canplaythrough", (event) => {
                document.getElementById(era.ppbtt).disabled = false;
                if (!isNaN(document.getElementById(era.audio).duration)) {
                    document.getElementById(era.dtime.total).textContent = toTime(document.getElementById(era.audio).duration);
                }
            });

            document.getElementById(era.audio).addEventListener("timeupdate", () => {
                document.getElementById("current-time").textContent = toTime(document.getElementById(era.audio).currentTime);
                document.getElementById(era.prbar).style.width = Math.floor((document.getElementById(era.audio).currentTime / document.getElementById(era.audio).duration) * 100,) + '%';
            });

            document.getElementById(era.audio).addEventListener("ended", () => {
                document.getElementById(era.prbar).style.width = 0 + '%';
                document.getElementById(era.audio).pause();
                document.getElementById(era.ppbtt).setAttribute("data-btt", "play");
                document.getElementById("current-time").textContent = "00:00";
            });

            document.getElementById(era.prcbr).addEventListener("click", (e) => {
                const clickPosition = (e.pageX - document.getElementById(era.prcbr).offsetLeft) / document.getElementById(era.prcbr).offsetWidth;
                const clickTime = clickPosition * document.getElementById(era.audio).duration;
                document.getElementById(era.audio).currentTime = clickTime;
            });
        }

        document.body.addEventListener('keydown', function(event) {
            if (event.code === 'Space') {
                mngPPtrack();
            }
        });

        if (typeof element !== undefined && typeof element !== null) {
            container = document.querySelector(element);
            if (!container) {
                throw new Error("No element specified!");
            }

            container.innerHTML = "<i>Loading...</i>";

            drawPlayer();

            if (isObjectElement(options) && !isObjectEmpty(options)) {
                if (options.hasOwnProperty("music") && Array.isArray(options.music) && !isEmpty(options.music)) {
                    const one = options.music[0];
                    if (isObjectElement(one) && !isObjectEmpty(one)) {
                        if (one.hasOwnProperty("song") && !isEmpty(one.song)) {
                            loadSong(one.song);
                        }
                    }
                }
            }
        }
    })(element, options);
